const express = require("express");
const router = express.Router();
const axios = require("axios");

// Environment variables should be used for sensitive data
const BOBERDOO_API_KEY =
  "9da9793c6b978898a5161fec247dcdf876dd7361faefdabee5feea31bb106391";
const BOBERDOO_API_URL =
  "https://convert2freedom.leadportal.com/new_api/api.php?Mode=full";

/**
 * Validate survey responses
 * @param {Object} data - Survey response data
 * @returns {Object} - Validation result
 */
function validateSurveyData(data) {
  const requiredFields = [
    "firstName",
    "lastName",
    "email",
    "phoneNumber",
    "doctorVisit",
    "hasAttorney",
    "atFault",
    "accidentDate",
    "incidentDescription",
  ];

  const missingFields = requiredFields.filter((field) => !data[field]);

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(data.email);

  // Validate phone number (basic validation)
  const phoneRegex = /^\+?[\d\s-]{10,}$/;
  const isPhoneValid = phoneRegex.test(data.phoneNumber);

  const errors = [];
  if (missingFields.length > 0) {
    errors.push(`Missing required fields: ${missingFields.join(", ")}`);
  }
  if (!isEmailValid) {
    errors.push("Invalid email format");
  }
  if (!isPhoneValid) {
    errors.push("Invalid phone number format");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Submit lead data to Boberdoo
 * @param {Object} leadData - The survey data from frontend
 * @returns {Promise} - Response from Boberdoo API
 */
async function submitToBoberdoo(leadData) {
  try {
    console.log(
      "Submit Survey - Raw leadData:",
      JSON.stringify(leadData, null, 2)
    );
    const formData = new URLSearchParams();
    formData.append("Key", BOBERDOO_API_KEY);
    formData.append("API_Action", "pingPostLead");
    formData.append("TYPE", "35");
    formData.append("SRC", "WreckRefunds");
    formData.append("Landing_Page", leadData.landingPage || "accident-survey");
    formData.append("firstName", leadData.firstName);
    formData.append("lastName", leadData.lastName);
    formData.append("email", leadData.email);
    formData.append("phoneNumber", leadData.phoneNumber?.replace(/\D/g, ""));
    formData.append(
      "accidentType",
      leadData.accidentType || "Automobile Accident"
    );
    formData.append("doctorVisit", leadData.doctorVisit || "Yes");
    formData.append("hasAttorney", leadData.hasAttorney || "No");
    formData.append("atFault", leadData.atFault || "No");
    formData.append("accidentDate", leadData.accidentDate || "Within 1 week");
    formData.append("Incident_Description", leadData.incidentDescription || "");

    console.log("Submit Survey - Final formData:", formData.toString());

    const response = await axios.post(BOBERDOO_API_URL, formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    console.log("Submit Survey - Boberdoo response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Submit Survey - Error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      request: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data,
        headers: error.config?.headers,
      },
    });
    throw error;
  }
}

// POST endpoint to handle survey submissions
router.post("/submit-survey", async (req, res) => {
  try {
    // Validate the survey data
    const validation = validateSurveyData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    // Check if any disqualifying answers were given
    if (
      req.body.hasAttorney === "Yes" || // Has attorney
      req.body.atFault === "Yes" || // Was at fault
      req.body.accidentDate === "Longer than 1 year" // Accident too old
    ) {
      return res.status(200).json({
        status: "disqualified",
        message: "Lead does not meet qualification criteria",
        reason: "Disqualifying answer in survey",
      });
    }

    // Submit to Boberdoo
    const boberdooResponse = await submitToBoberdoo(req.body);
    console.log({ boberdooResponse });
    // Handle the response
    // if (
    //   boberdooResponse.response?.status === "Matched" ||
    //   boberdooResponse.response?.status === "Unmatched"
    // ) {
    res.json({
      status: "success",
      message: "Survey submitted successfully",
      boberdooStatus: boberdooResponse,
    });
    // } else {
    //   throw new Error("Unexpected response from Boberdoo");
    // }
  } catch (error) {
    console.error("Error processing survey submission:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to process survey submission",
      error: error.message,
    });
  }
});

router.get("/", async (req, res) => {
  res.json({ message: "Leads API is running" });
});

/**
 * Test Boberdoo API connection
 */
router.get("/test-connection", async (req, res) => {
  try {
    const formData = new URLSearchParams();
    formData.append("Key", BOBERDOO_API_KEY);
    formData.append("API_Action", "pingPostLead");
    formData.append("TYPE", "35");
    formData.append("SRC", "WreckRefunds");
    formData.append("Landing_Page", "landing");
    formData.append("firstName", "John");
    formData.append("lastName", "Doe");
    formData.append("email", "test@nags.us");
    formData.append("phoneNumber", "3125551941");
    formData.append("accidentType", "Automobile Accident");
    formData.append("doctorVisit", "Yes");
    formData.append("hasAttorney", "Yes");
    formData.append("atFault", "Yes");
    formData.append("accidentDate", "Within 1 week");
    formData.append("Incident_Description", "Incident_Description");

    console.log("Test Connection - Final formData:", formData.toString());

    const response = await axios.post(BOBERDOO_API_URL, formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    console.log("Test Connection - Boberdoo response:", response.data);

    res.json({
      status: "success",
      message: "Test connection successful",
      response: response.data,
    });
  } catch (error) {
    console.error("Test Connection - Error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      request: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data,
        headers: error.config?.headers,
      },
    });

    res.status(500).json({
      status: "error",
      message: "Test connection failed",
      error: error.message,
      response: error.response?.data,
    });
  }
});

module.exports = router;
