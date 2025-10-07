# Product Requirements Document (PRD)

## Recruitment Assistance Platform

### 1. Product Overview

**Product Name:** Recruitment Assistance Platform  
**Version:** 1.1.0  
**Product Type:** Recruitment & Candidate Assessment System

The Recruitment Assistance Platform is a full-stack web solution designed to streamline the hiring process.  
Recruiters can post job listings, view candidate applications, see a ranked leaderboard based on resume screening + assessments, and contact shortlisted candidates.  
Candidates can register, upload resumes, apply to jobs, and take three types of assessments.  
The system includes an **automatic resume screening stage** to filter candidates before tests.

---

### 2. Target Users

- **Recruiters:** Post job listings, view and shortlist candidates, contact selected candidates.
- **Candidates:** Apply for job postings, pass resume screening, take assessments, and generate a performance score.

---

### 3. Core Features

#### 3.1 User Authentication & Authorization

- **User Registration:** Candidate/Recruiter account creation with email verification
- **User Login:** Secure JWT-based authentication
- **Password Management:** Change password, forgot/reset password functionality
- **Role-Based Access Control:** Candidate and Recruiter-specific permissions

#### 3.2 Candidate Flow

- **Profile Creation:** Enter personal details and upload resume
- **Job Application:** Apply to available jobs
- **Resume Screening:**
  - Automatic resume parsing & JD keyword matching
  - Resume scoring and filtering (Proceed/Reject)
- **Aptitude Test:** Logical, quantitative, verbal tests
- **Coding Test:** Programming problems with evaluation
- **CS Fundamentals Quiz:** MCQs from OS, DBMS, CN, DSA
- **Performance Score:** Weighted score (Resume + Tests)

#### 3.3 Recruiter Flow

- **Recruiter Profile Setup:** Add company and job preferences
- **Job Posting Management:** Create, update, and delete job posts
- **Candidate Application View:** View applicants for each job
- **Leaderboard View:** View ranked candidates (only recruiters)
- **Shortlisting Decision:**
  - **Contact Candidate** if interested
  - **Ignore Candidate** if not interested

#### 3.4 System Notifications

- Registration confirmation email
- Resume screening result email (Selected/Rejected)
- Test completion confirmation
- Recruiter contact notification to candidate

---

### 4. Technical Specifications

#### 4.1 API Endpoints Structure

**Authentication Routes** (`/api/v1/(candidate || recruiter)/auth/`)

- `POST /register` – Candidate/Recruiter registration
- `POST /login` – User authentication
- `GET /verify-email/:verificationToken` – Verify email
- `POST /refresh-token` – Refresh JWT token
- `POST /forgot-password` – Initiate password reset
- `POST /reset-password/:resetPasswordToken` – Reset password
- `POST /logout` – Logout (secured)
- `POST /resend-verify-email` – Resend Verification Token
- `POST /change-password` – Change password (secured)

**Candidate Routes** (`/api/v1/candidate/`)

- `GET /profile` – Get candidate profile
- `PUT /profile/:candidateId` – Update candidate profile
- `GET /jobs/` – see all jobs
- `GET /jobs/:jobId` – see specific jobs
- `POST /apply/:jobId` – Apply to job
- `POST /resume-screen/:jobId` – Trigger resume screening
- `POST /assessment/:assessmentToken` – Eligibility Check
- `POST /assessment/aptitude` – Submit aptitude result
- `POST /assessment/coding` – Submit coding result
- `POST /tests/cs-quiz` – Submit CS quiz result
- `GET /score/:jobId` – Get performance score

**Recruiter Routes** (`/api/v1/recruiter/`)

- `GET /profile` – Get recruiter profile
- `POST /profile/:recruiterId` – Update recruiter profile
- `GET /jobs` – List posted jobs
- `POST /jobs` – Post a new job
- `POST /jobs/:jobId` – update Job Posting
- `DELETE /jobs/:jobId` – delete Job Posting
- `GET /jobs/:jobId/questions` – get questions to be added
- `GET /jobs/:jobId/questions/:questionId` – see question
- `POST /jobs/:jobId/questions` – add questions
- `POST /jobs/:jobId/assessment` – start the assessment
- `GET /jobs/:jobId/leaderboard` – View candidate leaderboard
- `GET /jobs/:jobId/:candidateId` – Contact candidate

---

#### 4.2 Permission Matrix

| Feature                 | Recruiter | Candidate |
| ----------------------- | --------- | --------- |
| Register/Login          | ✓         | ✓         |
| Create Profile          | ✓         | ✓         |
| Post Jobs               | ✓         | ✗         |
| Apply for Job           | ✗         | ✓         |
| Resume Screening Access | ✗         | ✗         |
| Take Tests              | ✗         | ✓         |
| View Leaderboard        | ✓         | ✗         |
| Contact Candidates      | ✓         | ✗         |

---

#### 4.3 Data Models

**Candidate Performance Score (Weightage):**

| Component        | Weight |
| ---------------- | ------ |
| Resume Screening | 30%    |
| Aptitude Test    | 25%    |
| Coding Test      | 30%    |
| CS Quiz          | 15%    |

**User Roles:**

- `candidate` – Job seeker role
- `recruiter` – Employer/recruiter role

---

### 5. Security Features

- JWT-based authentication with refresh tokens
- Role-based authorization middleware
- Secure file upload for resumes
- Resume parsing with validation to avoid malicious files
- Input validation for all endpoints

---

### 6. File Management

- Resume file storage in secure directory or cloud bucket
- Automatic parsing for keywords & skills
- Metadata tracking (file name, size, type)

---

### 7. Success Criteria

- Smooth candidate journey: Application → Screening → Tests → Leaderboard → Recruiter Contact
- Resume screening accurately filters candidates
- Leaderboard ranks candidates correctly by weighted score
- Recruiter contact system works reliably
- Fully secure authentication and data handling
