import challenge from "../models/challenge.model.js";
import { s3, getPresignedURL } from "../utils/s3.util.js";
import {
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import { AWS_BUCKET_NAME } from "../config/env.js";
import { v4 as uuidv4 } from "uuid";

export const uploadChallenge = async (req, res, next) => {
  const { title, description, category } = req.body;
  const uuid = uuidv4();
  const s3Prefix = `challenges/${uuid}/`;

  try {
    const uploadFiles = req.files.map((file) => {
      const command = new PutObjectCommand({
        Bucket: AWS_BUCKET_NAME,
        Key: s3Prefix + file.originalname,
        Body: file.buffer,
      });
      return s3.send(command);
    });

    await Promise.all(uploadFiles);
    console.log(uploadFiles);

    const createChallenge = await challenge.create({
      uuid,
      title,
      description,
      category,
      s3_prefix: s3Prefix,
    });

    res.status(201).json({
      success: true,
      message: "Challenge created successfully",
      data: createChallenge,
    });
  } catch (err) {
    next(err);
  }
};

export const updateChallenge = async (req, res, next) => {
  const { uuid } = req.params;
  const { title, description, category } = req.body;
  const newFiles = req.files;
  console.log("UUID received:", uuid);

  try {
    const updatedChallenge = await challenge.findOneAndUpdate(
      { uuid },
      { title, description, category },
      {
        new: true,
      }
    );
    if (!updatedChallenge) {
      return res.status(400).json({ error: "Challenge not found" });
    }

    const s3Prefix = `challenges/${uuid}/`;

    //Check for new files
    if (newFiles && newFiles.length > 0) {
      //List of all existing files within the same directory
      const listCommand = new ListObjectsV2Command({
        Bucket: AWS_BUCKET_NAME,
        Prefix: s3Prefix,
      });
      const existingFiles = await s3.send(listCommand);

      //Delete the files

      if (existingFiles.Contents && existingFiles.Contents.length > 0) {
        const deleteCommand = new DeleteObjectsCommand({
          Bucket: AWS_BUCKET_NAME,
          Delete: {
            Objects: existingFiles.Contents.map((obj) => ({ Key: obj.Key })),
          },
        });
        await s3.send(deleteCommand);
      }

      //Upload the new file
      const uploadFiles = newFiles.map((file) => {
        const command = new PutObjectCommand({
          Bucket: AWS_BUCKET_NAME,
          Key: `${s3Prefix}${file.originalname}`,
          Body: file.buffer,
        });
        return s3.send(command);
      });

      await Promise.all(uploadFiles);
    }
    res.status(200).json({ success: true, data: updateChallenge });
  } catch (err) {
    next(err);
  }
};

export const deleteChallenge = async (req, res, next) => {
  const { uuid } = req.params;

  try {
    const deleteChallenge = await challenge.findOne({ uuid });
    if (!deleteChallenge) {
      return res.status(400).json({ error: "Challenge not found" });
    }

    const listCommand = new ListObjectsV2Command({
      Bucket: AWS_BUCKET_NAME,
      Prefix: deleteChallenge.s3_prefix,
    });

    const listedObjects = await s3.send(listCommand);

    if (listedObjects.Contents && listedObjects.Contents.length > 0) {
      const deleteCommand = new DeleteObjectsCommand({
        Bucket: AWS_BUCKET_NAME,
        Delete: {
          Objects: listedObjects.Contents.map((obj) => ({ Key: obj.Key })),
        },
      });

      await s3.send(deleteCommand);
    }

    await challenge.deleteOne({ uuid });
    res.status(204).json({
      success: true,
      message: "Challenge and files deleted success",
    });
  } catch (err) {
    next(err);
  }
};

export const getAllChallenges = async (req, res, next) => {
  const allChallenges = await challenge.find();
  const allChallengesArray = [];

  try {
    for (const item of allChallenges) {
      const s3Prefix = item.s3_prefix;
      const listCommand = new ListObjectsV2Command({
        Bucket: AWS_BUCKET_NAME,
        Prefix: s3Prefix,
      });

      const list = await s3.send(listCommand);
      const files = [];

      if (list.Contents && list.Contents.length > 0) {
        for (const obj of list.Contents) {
          const url = await getPresignedURL(obj.Key);
          files.push({ filename: obj.Key.replace(s3Prefix, ""), url });
        }
      }

      const newChallenge = {
        uuid: item.uuid,
        title: item.title,
        category: item.category,
        description: item.description,
        files,
      };
      allChallengesArray.push(newChallenge);
    }
    res.status(200).json({
      success: true,
      data: allChallengesArray,
      message: "Challenges fetched successfully",
    });
  } catch (err) {
    next(err);
  }
};
