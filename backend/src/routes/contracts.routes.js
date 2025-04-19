import { Router } from "express";
import { initiateAgreement } from "../controllers/agreement.controller.js";
const router = Router();

router.route("/initiateAgreement").post(initiateAgreement); //don

export default router;
