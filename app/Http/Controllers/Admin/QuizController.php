<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\QuizQuestionRequest;
use App\Http\Requests\Admin\QuizRequest;
use App\Models\Lesson;
use App\Models\Module;
use App\Models\Quiz;
use App\Models\QuizQuestion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class QuizController extends Controller
{
    /**
     * The quiz page of a lesson: the quiz settings (or its creation form
     * when the lesson has no quiz yet) and the list of its questions.
     */
    public function edit(Module $module, Lesson $lesson): Response
    {
        $lesson = $this->lessonInModule($module, $lesson);
        $quiz = $lesson->quiz()->with(['questions' => fn ($query) => $query->ordered()])->first();

        return Inertia::render('admin/modules/lessons/quiz', [
            'module' => $module,
            'lesson' => $lesson,
            'quiz' => $quiz === null ? null : [
                'title' => $quiz->title,
                'is_active' => $quiz->is_active,
            ],
            'questions' => $quiz?->questions
                ->map(fn (QuizQuestion $question): array => [
                    'id' => $question->id,
                    'prompt' => $question->prompt,
                    'options' => $question->options,
                    'correct_option' => $question->correct_option,
                    'explanation' => $question->explanation,
                ])
                ->values()
                ->all() ?? [],
        ]);
    }

    /**
     * Create the quiz of a lesson that has none yet.
     */
    public function store(QuizRequest $request, Module $module, Lesson $lesson): RedirectResponse
    {
        $lesson = $this->lessonInModule($module, $lesson);
        abort_if($lesson->quiz()->exists(), 409);

        $lesson->quiz()->create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Quiz créé.']);

        return $this->redirectToQuiz($module, $lesson);
    }

    /**
     * Update the quiz settings (title, publication).
     */
    public function update(QuizRequest $request, Module $module, Lesson $lesson): RedirectResponse
    {
        $lesson = $this->lessonInModule($module, $lesson);
        $this->quizOf($lesson)->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Quiz mis à jour.']);

        return $this->redirectToQuiz($module, $lesson);
    }

    /**
     * Append a question at the end of the quiz.
     */
    public function storeQuestion(QuizQuestionRequest $request, Module $module, Lesson $lesson): RedirectResponse
    {
        $lesson = $this->lessonInModule($module, $lesson);
        $this->quizOf($lesson)->questions()->create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Question ajoutée.']);

        return $this->redirectToQuiz($module, $lesson);
    }

    /**
     * Update one question of the quiz.
     */
    public function updateQuestion(QuizQuestionRequest $request, Module $module, Lesson $lesson, QuizQuestion $question): RedirectResponse
    {
        $lesson = $this->lessonInModule($module, $lesson);
        $this->questionInQuiz($this->quizOf($lesson), $question)->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Question mise à jour.']);

        return $this->redirectToQuiz($module, $lesson);
    }

    /**
     * Delete one question of the quiz.
     */
    public function destroyQuestion(Module $module, Lesson $lesson, QuizQuestion $question): RedirectResponse
    {
        $lesson = $this->lessonInModule($module, $lesson);
        $this->questionInQuiz($this->quizOf($lesson), $question)->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Question supprimée.']);

        return $this->redirectToQuiz($module, $lesson);
    }

    /**
     * Save the question order (drag and drop or move up/down).
     */
    public function reorderQuestions(Request $request, Module $module, Lesson $lesson): RedirectResponse
    {
        $lesson = $this->lessonInModule($module, $lesson);
        $quiz = $this->quizOf($lesson);

        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'distinct', Rule::exists('quiz_questions', 'id')->where('quiz_id', $quiz->id)],
        ]);

        QuizQuestion::setNewOrder($validated['ids']);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Ordre des questions mis à jour.']);

        return $this->redirectToQuiz($module, $lesson);
    }

    /**
     * The lesson, when it really belongs to the given module.
     */
    private function lessonInModule(Module $module, Lesson $lesson): Lesson
    {
        abort_unless($lesson->module_id === $module->id, 404);

        return $lesson;
    }

    /**
     * The quiz of the lesson (404 when the lesson has no quiz yet).
     */
    private function quizOf(Lesson $lesson): Quiz
    {
        $quiz = $lesson->quiz;

        abort_if($quiz === null, 404);

        return $quiz;
    }

    /**
     * The question, when it really belongs to the quiz.
     */
    private function questionInQuiz(Quiz $quiz, QuizQuestion $question): QuizQuestion
    {
        abort_unless($question->quiz_id === $quiz->id, 404);

        return $question;
    }

    /**
     * Back to the quiz page of the lesson.
     */
    private function redirectToQuiz(Module $module, Lesson $lesson): RedirectResponse
    {
        return to_route('admin.modules.lessons.quiz.edit', [$module, $lesson]);
    }
}
