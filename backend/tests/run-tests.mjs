import assert from 'assert';
import { extractAnswersFromExam } from '../controllers/candidateCtrl.js';

function testExtractSimple() {
  const exam = {
    questions: {
      mcqs: [
        { _id: 'q1', selectedOption: 'A' },
        { _id: 'q2' } // no answer
      ],
      shortQuestions: [
        { _id: 's1', studentAnswer: 'Because...' },
        { _id: 's2' }
      ]
    }
  };

  const { mcqAnswers, shortAnswers } = extractAnswersFromExam(exam);
  assert.strictEqual(mcqAnswers.length, 1, 'Should extract 1 mcq answer');
  assert.strictEqual(mcqAnswers[0].questionId, 'q1');
  assert.strictEqual(mcqAnswers[0].selectedOption, 'A');
  assert.strictEqual(shortAnswers.length, 1, 'Should extract 1 short answer');
  assert.strictEqual(shortAnswers[0].questionId, 's1');
  assert.strictEqual(shortAnswers[0].answerText, 'Because...');
}

function testAlternateFieldNames() {
  const exam = {
    questions: {
      mcqs: [ { _id: 'q3', selected: 'B' }, { _id: 'q4', response: 'C' } ],
      shortQuestions: [ { _id: 's3', responseText: 'Ans' }, { _id: 's4', selectedAnswer: 'Other' } ]
    }
  };
  const { mcqAnswers, shortAnswers } = extractAnswersFromExam(exam);
  assert.strictEqual(mcqAnswers.length, 2);
  assert.deepStrictEqual(mcqAnswers.map(a => a.selectedOption), ['B','C']);
  assert.strictEqual(shortAnswers.length, 2);
}

function run() {
  console.log('Running tests...');
  testExtractSimple();
  testAlternateFieldNames();
  console.log('All tests passed');
}

run();
