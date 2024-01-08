import { PrismaClient } from "@prisma/client";
import express from 'express';
import multer from "multer";
import {v2 as cloudinary}from "cloudinary";
import dotenv from "dotenv";
import cors from "cors";
import { unlink } from "node:fs";
dotenv.config();


const app = express();
app.use(cors());
// app.use(express().json);
// let global_url = ""

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public/assets");
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  });

const upload = multer({storage});

 cloudinary.config({
    cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret
 });

 const prisma = new PrismaClient();

 app.post("/image", upload.single("picture"), async (req, res) => {
  try {
    const response = await cloudinary.uploader.upload(req.file.path);
    const { url } = response;
    // global_url=url;
    // console.log(`This is the url from cloudinary: ${url}`);
    // res.status(200).json({ url }); // Send a success response
    main(url)
    .then(async()=>{
        await prisma.$disconnect();
    })
    .catch(async(e)=>{

        console.log(`error is: ${e}`);
        await prisma.$disconnect();
        process.exit();
    })
    unlink(req.file.path, (err) => {
      if (err) throw err;
      console.log("path/file.txt was deleted");
    });
    res.status(200).json({url});
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    res.status(500).json({ error: "Internal Server Error" }); // Send an error response
  }
});





async function main(url){
    await prisma.user.create({
        data:{
            firstName: "new",
    lastName: "Avinash",
    age: 22,
    occupation: "Student",
    url: url
        }
        
    });
    // const allUsers = await prisma.user.findMany();
    // console.log(allUsers);
}






    app.listen(3000,()=>{console.log("listening to port 3000");})