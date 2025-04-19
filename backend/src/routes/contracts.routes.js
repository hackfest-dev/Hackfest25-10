import { Router } from "express";
import { getBorrowerAgreementDetails, getLenderAgreementDetails, initiateAgreement, payEmi } from "../controllers/agreement.controller.js";
const router = Router();

router.route("/initiateAgreement").post(initiateAgreement); //don
router.route("/payEmi").post(payEmi); //don
router.route("/getBorrowerDetails/:borrowerId").get(getBorrowerAgreementDetails);
router.route("/getLenderDetails/:lenderId").get(getLenderAgreementDetails); //don

export default router;
