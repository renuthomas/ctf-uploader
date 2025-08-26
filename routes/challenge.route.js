import { Router } from "express";
import {
  updateChallenge,
  uploadChallenge,
  getAllChallenges,
  deleteChallenge,
} from "../controllers/challenge.controller.js";
import { upload } from "../utils/multer.util.js";

const challengeRoute = Router();

challengeRoute.post("/", upload.array("files"), uploadChallenge);
challengeRoute.put("/:uuid", upload.array("files"), updateChallenge);
challengeRoute.get("/", getAllChallenges);
challengeRoute.delete("/:uuid", deleteChallenge);

export default challengeRoute;
