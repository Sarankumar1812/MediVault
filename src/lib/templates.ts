// lib/templates.ts
export const generateHealthReportTemplate = (userName: string) => {
  const currentDate = new Date().toISOString().split('T')[0]
  
  const csvTemplate = `Patient Information,${userName},Date,${currentDate}
Report Type,Complete Blood Count (CBC),Test Date,${currentDate}
,,,
Test Name,Result,Units,Reference Range
White Blood Cells (WBC),7.5,x10^9/L,4.0-11.0
Red Blood Cells (RBC),5.2,x10^12/L,4.5-6.0
Hemoglobin (Hb),15.0,g/dL,13.5-17.5
Hematocrit (Hct),45,%,40-52
Mean Corpuscular Volume (MCV),88,fL,80-100
Mean Corpuscular Hemoglobin (MCH),29,pg,27-32
Mean Corpuscular Hemoglobin Concentration (MCHC),33,g/dL,32-36
Platelets,250,x10^9/L,150-450
Neutrophils,55,%,40-75
Lymphocytes,35,%,20-50
Monocytes,7,%,2-10
Eosinophils,2,%,1-6
Basophils,1,%,0-2
,,,
Doctor's Notes,"Results are within normal limits. No abnormalities detected."
Recommendations,"Continue with regular annual check-ups. Maintain healthy diet and exercise."
`

  const excelTemplate = `PATIENT HEALTH REPORT
====================

Patient Details:
---------------
Name: ${userName}
Date of Birth: [Enter DOB]
Gender: [Enter Gender]
Report Date: ${currentDate}

Complete Blood Count (CBC) Results:
---------------------------------
╔══════════════════════════════════════════════════════════════════════════════╗
║ Test                          Result   Units     Reference Range             ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ White Blood Cells (WBC)       7.5      x10^9/L   4.0 - 11.0                 ║
║ Red Blood Cells (RBC)         5.2      x10^12/L  4.5 - 6.0                  ║
║ Hemoglobin (Hb)               15.0     g/dL      13.5 - 17.5                ║
║ Hematocrit (Hct)              45       %         40 - 52                    ║
║ Mean Corpuscular Volume (MCV) 88       fL        80 - 100                   ║
║ Mean Corpuscular Hemoglobin   29       pg        27 - 32                    ║
║ Platelets                     250      x10^9/L   150 - 450                  ║
╚══════════════════════════════════════════════════════════════════════════════╝

Lipid Profile:
-------------
╔══════════════════════════════════════════════════════════════════════════════╗
║ Test                          Result   Units     Reference Range             ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Total Cholesterol             180      mg/dL     < 200                      ║
║ HDL Cholesterol               55       mg/dL     > 40                       ║
║ LDL Cholesterol               110      mg/dL     < 100                      ║
║ Triglycerides                 120      mg/dL     < 150                      ║
╚══════════════════════════════════════════════════════════════════════════════╝

Liver Function Test:
-------------------
╔══════════════════════════════════════════════════════════════════════════════╗
║ Test                          Result   Units     Reference Range             ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Alanine Transaminase (ALT)    25       U/L       7 - 56                     ║
║ Aspartate Transaminase (AST)   28       U/L       10 - 40                    ║
║ Alkaline Phosphatase (ALP)     85       U/L       44 - 147                   ║
║ Total Bilirubin                0.8      mg/dL     0.1 - 1.2                  ║
╚══════════════════════════════════════════════════════════════════════════════╝

Thyroid Function:
---------------
TSH: 2.5 mIU/L (Normal: 0.4-4.0)
T3: 120 ng/dL (Normal: 80-200)
T4: 8.5 μg/dL (Normal: 5-12)

Kidney Function:
--------------
╔══════════════════════════════════════════════════════════════════════════════╗
║ Test                          Result   Units     Reference Range             ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Blood Urea Nitrogen (BUN)     15       mg/dL     7 - 20                     ║
║ Creatinine                     0.9      mg/dL     0.6 - 1.3                  ║
║ Glomerular Filtration Rate     90       mL/min    > 60                       ║
╚══════════════════════════════════════════════════════════════════════════════╝

Blood Glucose:
-------------
Fasting: 95 mg/dL (Normal: 70-100)
Postprandial (2 hours): 125 mg/dL (Normal: < 140)

Vitamins & Minerals:
------------------
Vitamin D: 35 ng/mL (Optimal: >30)
Vitamin B12: 450 pg/mL (Normal: 200-900)
Iron: 85 μg/dL (Normal: 65-175)
Ferritin: 75 ng/mL (Normal: 30-400)

Doctor's Summary:
----------------
All test results are within normal limits. The patient shows excellent overall health markers.

Recommendations:
--------------
1. Continue with current lifestyle and diet
2. Maintain regular exercise routine (30 minutes daily)
3. Annual health check-up recommended
4. Stay hydrated and maintain balanced nutrition
5. Monitor blood pressure regularly

Next Review Date: ${new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]}

Physician's Signature:
____________________
[Doctor Name]
[License Number]
[Date]
`

  const simpleTemplate = `HEALTH REPORT - ${userName}
========================

PATIENT INFORMATION
------------------
Name: ${userName}
Age: [Enter Age]
Gender: [Enter Gender]
Date: ${currentDate}

VITAL SIGNS
-----------
Blood Pressure: [Enter BP] mmHg
Heart Rate: [Enter HR] bpm
Temperature: [Enter Temp] °C
Respiratory Rate: [Enter RR] breaths/min
Oxygen Saturation: [Enter SpO2] %

BLOOD TESTS
-----------
Complete Blood Count (CBC):
  - WBC: [Enter Value] (4.0-11.0 x10^9/L)
  - RBC: [Enter Value] (4.5-6.0 x10^12/L)
  - Hemoglobin: [Enter Value] (13.5-17.5 g/dL)
  - Platelets: [Enter Value] (150-450 x10^9/L)

Lipid Profile:
  - Total Cholesterol: [Enter Value] (<200 mg/dL)
  - HDL: [Enter Value] (>40 mg/dL)
  - LDL: [Enter Value] (<100 mg/dL)
  - Triglycerides: [Enter Value] (<150 mg/dL)

Blood Glucose:
  - Fasting: [Enter Value] (70-100 mg/dL)
  - Post-meal: [Enter Value] (<140 mg/dL)

Liver Function:
  - ALT: [Enter Value] (7-56 U/L)
  - AST: [Enter Value] (10-40 U/L)
  - ALP: [Enter Value] (44-147 U/L)

Kidney Function:
  - Creatinine: [Enter Value] (0.6-1.3 mg/dL)
  - BUN: [Enter Value] (7-20 mg/dL)

IMAGING REPORTS
--------------
[X-Ray/CT/MRI/USG]:
  - Date: [Enter Date]
  - Findings: [Enter Findings]
  - Impression: [Enter Impression]

DOCTOR'S NOTES
-------------
[Enter detailed notes about the patient's condition, observations, and findings]

RECOMMENDATIONS
--------------
1. [Recommendation 1]
2. [Recommendation 2]
3. [Recommendation 3]
4. [Recommendation 4]

FOLLOW-UP
--------
Next Appointment: [Enter Date]
Follow-up Tests: [Enter Tests]

SIGNATURE
--------
____________________
[Doctor's Name]
[Qualification]
[License Number]
[Date]
`

  return {
    csv: csvTemplate,
    excel: excelTemplate,
    simple: simpleTemplate
  }
}