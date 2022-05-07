document.addEventListener('DOMContentLoaded', () => {
  const App = (function() {
    const questions = [
      {
        id: 1,
        description: "Who is the author of <cite>The Hitchhiker's Guide to the Galaxy</cite>?",
        options: ['Dan Simmons', 'Douglas Adams', 'Stephen Fry', 'Robert A. Heinlein'],
      },
      {
        id: 2,
        description: 'Which of the following numbers is the answer to Life, the \
                      Universe and Everything?',
        options: ['66', '13', '111', '42'],
      },
      {
        id: 3,
        description: 'What is Pan Galactic Gargle Blaster?',
        options: ['A drink', 'A machine', 'A creature', 'None of the above'],
      },
      {
        id: 4,
        description: 'Which star system does Ford Prefect belong to?',
        options: ['Aldebaran', 'Algol', 'Betelgeuse', 'Alpha Centauri'],
      },
    ];
    
    const answerKey = { '1': 'Douglas Adams', '2': '42', '3': 'A drink', '4': 'Betelgeuse' };
  
    const MultipleChoiceQuiz = function() {
      this.questions = questions;
      this.answers = answerKey;
      this.questionTemplate = Handlebars.compile(document.getElementById('question_template').innerHTML);
      this.submitButton = document.querySelector('.submit');
      this.resetButton = document.querySelector('.reset_form');
      this.renderQuestions();
      this.bindEvents();
    };
  
    MultipleChoiceQuiz.prototype = {
      renderQuestions() {
        let questionArea = document.querySelector('fieldset');
        this.questions.forEach(question => {
          let questionHTML = this.questionTemplate(question);
          questionArea.insertAdjacentHTML('beforeend', questionHTML);
        });
      },
  
      bindEvents() {
        this.submitButton.addEventListener('click', this.handleSubmit.bind(this));
        this.resetButton.addEventListener('click', this.resetForm.bind(this));
      },

      markQuestion(question) {
        let questionId = question.getAttribute('data-id');
        let userAnswer = question.querySelector('input:checked');
        let userAnswerValue;
        if (userAnswer) {
          userAnswerValue = userAnswer.value;
        }
        let resultArea = question.querySelector('.result');
        let correctAnswer = this.answers[questionId];

        if (!userAnswer) {
          this.markUnanswered(resultArea, correctAnswer);
        } else if (userAnswerValue === correctAnswer) {
          this.markCorrect(resultArea);
        } else {
          this.markIncorrect(resultArea, correctAnswer);
        }
      },

      markAnswers() {
        let userQuestions = Array.prototype.slice.call(document.querySelectorAll('.question'));

        userQuestions.forEach(question => {
          this.markQuestion(question);
        });
      },

      markUnanswered(resultArea, correctAnswer) {
        resultArea.textContent = `You didn't answer this question. Correct answer is: "${correctAnswer}".`;
        resultArea.classList.add('wrong');
      },

      markCorrect(resultArea) {
        resultArea.textContent = 'Correct Answer';
        resultArea.classList.add('correct');
      },

      markIncorrect(resultArea, correctAnswer) {
        resultArea.textContent = `Wrong Answer. The correct answer is: "${correctAnswer}".`;
        resultArea.classList.add('wrong');
      },

      handleSubmit(event) {
        event.preventDefault();

        if (!this.submitButton.disabled) {
          this.submitButton.disabled = true;
          this.submitButton.classList.add('disabled');
          this.markAnswers();
          this.resetButton.disabled = false;
          this.resetButton.classList.remove('disabled');
        }
      },

      resetForm(event) {
        event.preventDefault();

        document.querySelector('form').reset();

        let allResults = Array.prototype.slice.call(document.querySelectorAll('.result'));
        allResults.forEach(result => {
          result.textContent = '';
          result.setAttribute('class', 'result');
        });

        this.resetButton.disabled = true;
        this.resetButton.classList.add('disabled');
        this.submitButton.disabled = false;
        this.submitButton.classList.remove('disabled');
      },
    };
  
    MultipleChoiceQuiz.prototype.constructor = MultipleChoiceQuiz;
  
    new MultipleChoiceQuiz;
  })();  
});
