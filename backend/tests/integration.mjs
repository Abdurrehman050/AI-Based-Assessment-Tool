import dotenv from 'dotenv';
import fetch from 'node-fetch';
import mongoose from 'mongoose';
import Exam from '../models/Exam.js';

dotenv.config();

const BASE = `http://localhost:${process.env.PORT || 8000}`;

function parseSetCookie(setCookie) {
  if (!setCookie) return '';
  // take the first cookie token up to ';'
  const parts = setCookie.split(';').map(p => p.trim());
  return parts[0];
}

async function main() {
  console.log('Integration test started');

  // 1. Register teacher
  let res = await fetch(`${BASE}/api/v1/teachers/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 't_integ', email: 't_integ@example.com', password: 'secret123', subject: 'Math' }),
  });
  const teacherReg = await res.json().catch(() => ({}));
  console.log('teacher register:', teacherReg.message || teacherReg);

  // 2. Login teacher
  res = await fetch(`${BASE}/api/v1/teachers/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 't_integ@example.com', password: 'secret123' }),
  });
  const teacherLogin = await res.json().catch(() => ({}));
  const teacherCookie = parseSetCookie(res.headers.get('set-cookie'));
  console.log('teacher login:', teacherLogin.message || teacherLogin, 'cookie:', teacherCookie);

  const teacherId = teacherLogin.teacher?._id || teacherReg._id || teacherLogin._id;

  // 3. Connect to DB and create an exam (avoid Gemini)
  await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.MONGO_DBNAME });
  console.log('Connected to DB');

  const mcq1 = { question: '2+2?', options: ['1','2','3','4'], answer: '4' };
  const mcq2 = { question: '3*3?', options: ['6','9','12','3'], answer: '9' };
  const s1 = { question: 'Solve x+2=5', answer: 'x=3' };
  const s2 = { question: 'Define variable', answer: 'A symbol that stores value' };

  const examDoc = await Exam.create({
    title: 'Integration Exam',
    level: 'easy',
    questionType: 'mixed',
    numMcqs: 2,
    numShorts: 2,
    examKey: 'INTEG-001',
    questions: { mcqs: [mcq1, mcq2], shortQuestions: [s1, s2] },
    createdBy: teacherId,
  });
  console.log('Created exam:', examDoc._id.toString());

  // 4. Register candidate
  res = await fetch(`${BASE}/api/v1/candidates/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'c_integ', email: 'c_integ@example.com', password: 'candpass' }),
  });
  const candReg = await res.json().catch(() => ({}));
  console.log('candidate register:', candReg.message || candReg);

  // 5. Candidate login
  res = await fetch(`${BASE}/api/v1/candidates/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'c_integ@example.com', password: 'candpass' }),
  });
  const candLogin = await res.json().catch(() => ({}));
  const candCookie = parseSetCookie(res.headers.get('set-cookie'));
  console.log('candidate login:', candLogin.message || candLogin, 'cookie:', candCookie);

  // 6. Candidate submit exam
  const examId = examDoc._id.toString();
  // need question IDs from examDoc
  const mcqIds = examDoc.questions.mcqs.map(q => q._id.toString());
  const shortIds = examDoc.questions.shortQuestions.map(q => q._id.toString());

  const submissionBody = {
    examId,
    mcqAnswers: [
      { questionId: mcqIds[0], selectedOption: '4' },
      { questionId: mcqIds[1], selectedOption: '9' }
    ],
    shortAnswers: [
      { questionId: shortIds[0], answerText: 'x=3' },
      { questionId: shortIds[1], answerText: 'A value holder' }
    ]
  };

  res = await fetch(`${BASE}/api/v1/candidates/submit-exam`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': candCookie },
    body: JSON.stringify(submissionBody),
  });
  const submissionResp = await res.json().catch(() => ({}));
  console.log('submission response:', submissionResp.message || submissionResp);
  const submissionId = submissionResp.submission?._id;

  // 7. Teacher manually grade the submission
  const manualGrades = {
    shortAnswers: [
      { questionId: shortIds[0], score: 1, feedback: 'Correct' },
      { questionId: shortIds[1], score: 0, feedback: 'Needs detail' }
    ]
  };

  res = await fetch(`${BASE}/api/v1/teachers/submissions/${submissionId}/grade-manual`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': teacherCookie },
    body: JSON.stringify(manualGrades),
  });
  const gradeResp = await res.json().catch(() => ({}));
  console.log('manual grade response:', gradeResp.message || gradeResp);

  // 8. Teacher fetch exam submissions
  res = await fetch(`${BASE}/api/v1/teachers/exams/${examId}/submissions`, {
    headers: { 'Cookie': teacherCookie }
  });
  const examSubs = await res.json().catch(() => ({}));
  console.log('exam submissions:', JSON.stringify(examSubs, null, 2));

  // 9. Candidate fetch their submission
  res = await fetch(`${BASE}/api/v1/candidates/submissions/${submissionId}`, {
    headers: { 'Cookie': candCookie }
  });
  const candSub = await res.json().catch(() => ({}));
  console.log('candidate submission view:', JSON.stringify(candSub, null, 2));

  console.log('Integration test done');
  process.exit(0);
}

main().catch(err => {
  console.error('Integration test error:', err);
  process.exit(1);
});
