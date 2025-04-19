import { Router } from "express";
import { createPendingRequest, getAllPendingRequests } from "../controllers/buy.controller.js";

const router = Router();

router.route("/create").post(createPendingRequest);
router.route("/getPendingBorrowers").get(getAllPendingRequests)

export default router