import { exec } from "child_process";
import path from "path";

export const verifyKycML = (selfiePath, documentPath) => {
    return new Promise((resolve, reject) => {
        const pythonScript = path.resolve("src/utils/verify_kyc.py");
        const command = `python3 ${pythonScript} ${selfiePath} ${documentPath}`;
        
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error("Python script error:", error.message);
                return reject("Internal server error during KYC verification.");
            }

            if (stderr) {
                console.error("Python script stderr:", stderr);
            }

            // Log stdout for debugging
            console.log("Python script output (stdout):", stdout);

            try {
                // Parse the JSON output
                const result = JSON.parse(stdout.trim());

                console.log("KYC verification result:", result.status);

                if (result.status === "MATCH") {
                    resolve(true);
                } else if (result.status === "NO_MATCH") {
                    resolve(false);
                } else {
                    reject("Unexpected result in the KYC verification.");
                }
            } catch (err) {
                console.error("Error parsing JSON:", err);
                reject("Error parsing KYC result.");
            }
        });
    });
};
