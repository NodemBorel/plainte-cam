const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require.resolve('../js/modules/questionnaire.js'), 'utf8');
const container = { appendChild() {}, scrollHeight: 0, scrollTop: 0 };
const context = {
	console,
	setTimeout() {},
	clearTimeout() {},
	document: {
		getElementById: () => container,
		createElement: () => ({ appendChild() {}, className: '', textContent: '' })
	}
};
vm.createContext(context);
vm.runInContext(`${source}\nthis.scoreCompletude = scoreCompletude; this.questionsPour = questionsPour; this.questionsManquantes = questionsManquantes; this.enregistrerReponse = enregistrerReponse; this.answers = qaAnswers;`, context);
const questions = context.questionsPour('Vol simple');
const text = 'Un homme a vole mon telephone mardi soir.';
const unanswered = context.scoreCompletude(text, 'Vol simple', {});
const missingBefore = context.questionsManquantes(text, 'Vol simple', {});
context.enregistrerReponse(questions[3], 'Oui, il y avait deux témoins.');
const oneAnswered = context.scoreCompletude(text, 'Vol simple', context.answers);
const missingAfter = context.questionsManquantes(text, 'Vol simple', context.answers);
if (!context.answers[questions[3].q]) throw new Error('Questionnaire answer was not stored under its question text.');
if (!(oneAnswered > unanswered)) throw new Error('Answering a missing questionnaire signal did not raise the completion score.');
if (missingBefore.length !== missingAfter.length + 1 || missingAfter.some(question => question.q === questions[3].q)) throw new Error('The adaptive questionnaire did not remove the answered question.');
if (context.questionsPour('Vol simple')[0].q === context.questionsPour('Escroquerie / Fraude')[0].q) throw new Error('Different incident types should ask different questions.');
console.log(JSON.stringify({ unanswered, oneAnswered, remainingQuestions: missingAfter.length, variesByIncident: true, passed: true }));
