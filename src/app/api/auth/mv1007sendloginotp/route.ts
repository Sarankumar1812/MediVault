import { NextRequest } from "next/server";
import {
  generateOTP,
  hashOTP,
  getUserByEmail,
  saveOTP,
} from "@/lib/database";
import { emailService } from "@/lib/email-service";
import { contactMethodSchema } from "@/lib/schemas/authSchemas";
import { ApiResponse, sendResponse } from "@/lib/utils/apiResponse";

export const runtime = "nodejs";


export async function POST(request: NextRequest) {
  try {
    /* ----------------------------------------------------
       1. Parse & validate request
    ---------------------------------------------------- */
    const body = await request.json();
    const validation = contactMethodSchema.safeParse(body);

    if (!validation.success) {
      return sendResponse(
        ApiResponse.validationError(
          validation.error.flatten().fieldErrors
        ),
        400
      );
    }

    const { contact } = validation.data;

    /* ----------------------------------------------------
       2. Enforce EMAIL login only
    ---------------------------------------------------- */
    const isEmail = contact.includes("@");
    if (!isEmail) {
      return sendResponse(
        ApiResponse.error("Please use a valid email address"),
        400
      );
    }

    const email = contact.toLowerCase().trim();

    /* ----------------------------------------------------
       3. Fetch user
    ---------------------------------------------------- */
    const user = await getUserByEmail(email);

    if (!user) {
      return sendResponse(
        ApiResponse.error(
          "No account found with this email. Please sign up first."
        ),
        404
      );
    }

    if (user.mv_ut_account_status !== "active") {
      return sendResponse(
        ApiResponse.error(
          `Account is ${user.mv_ut_account_status}. Please contact support.`
        ),
        403
      );
    }

    /* ----------------------------------------------------
       4. Generate & store OTP (SAFE)
    ---------------------------------------------------- */
    const otp = generateOTP(6);
    const otpHash = hashOTP(otp);

    // 🔒 Transaction-safe UPSERT
    await saveOTP(
      "email",
      email,
      otpHash,
      "login",
      user.mv_ut_id
    );

    /* ----------------------------------------------------
       5. Send OTP Email
    ---------------------------------------------------- */
    try {
      const sent = await emailService.sendOTP(
        email,
        otp,
        "login"
      );

      if (!sent) {
        return sendResponse(
          ApiResponse.error(
            "Failed to send OTP email. Please try again."
          ),
          500
        );
      }
    } catch (err) {
      console.error("Email service error:", err);
      return sendResponse(
        ApiResponse.error(
          "Email service temporarily unavailable. Please try again later."
        ),
        503
      );
    }

    /* ----------------------------------------------------
       6. Success response
    ---------------------------------------------------- */
    return sendResponse(
      ApiResponse.success("Login OTP sent successfully", {
        email,
        userId: user.mv_ut_id,
        ...(process.env.NODE_ENV === "development" && {
          debugOtp: otp,
        }),
      }),
      200
    );
  } catch (error) {
    console.error("Send login OTP error:", error);
    return sendResponse(
      ApiResponse.error("Failed to send login OTP"),
      500
    );
  }
}
