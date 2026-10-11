<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\LessonRequest;
use App\Models\Lesson;
use App\Models\Module;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class LessonController extends Controller
{
    /**
     * Show the form to create a lesson inside a module.
     */
    public function create(Module $module): Response
    {
        return Inertia::render('admin/modules/lessons/create', [
            'module' => $module,
        ]);
    }

    /**
     * Store a new lesson: the slug and the order are scoped to the module.
     */
    public function store(LessonRequest $request, Module $module): RedirectResponse
    {
        $module->lessons()->create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Leçon créée.']);

        return $this->redirectToModule($module);
    }

    /**
     * Show the form to edit a lesson.
     */
    public function edit(Module $module, Lesson $lesson): Response
    {
        return Inertia::render('admin/modules/lessons/edit', [
            'module' => $module,
            'lesson' => $this->lessonInModule($module, $lesson),
        ]);
    }

    /**
     * Update a lesson: the slug is never regenerated.
     */
    public function update(LessonRequest $request, Module $module, Lesson $lesson): RedirectResponse
    {
        $this->lessonInModule($module, $lesson)->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Leçon mise à jour.']);

        return $this->redirectToModule($module);
    }

    /**
     * Delete a lesson.
     */
    public function destroy(Module $module, Lesson $lesson): RedirectResponse
    {
        $this->lessonInModule($module, $lesson)->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Leçon supprimée.']);

        return $this->redirectToModule($module);
    }

    /**
     * Persist the new lesson order inside the module after a drag and drop.
     */
    public function reorder(Request $request, Module $module): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => [
                'integer',
                'distinct',
                Rule::exists('lessons', 'id')->where('module_id', $module->id),
            ],
        ]);

        Lesson::setNewOrder($validated['ids']);

        return back();
    }

    /**
     * A lesson can only be reached through its own module.
     */
    private function lessonInModule(Module $module, Lesson $lesson): Lesson
    {
        abort_unless($lesson->module_id === $module->id, 404);

        return $lesson;
    }

    /**
     * Every lesson action lands back on the lessons tab of the module.
     */
    private function redirectToModule(Module $module): RedirectResponse
    {
        return to_route('admin.modules.edit', ['module' => $module, 'tab' => 'lecons']);
    }
}
