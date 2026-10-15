<?php

namespace App\Http\Controllers\Learner;

use App\Http\Controllers\Controller;
use App\Models\Level;
use App\Services\LearningPathService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class LearningPathController extends Controller
{
    public function index(Request $request, LearningPathService $learningPath): Response
    {
        $user = $request->user();
        $selectedLevel = $learningPath->selectedLevel($user);
        $previewLevel = $selectedLevel ?? $learningPath->defaultLevel();

        return Inertia::render('learner/learn/index', [
            'levels' => Level::query()
                ->ordered()
                ->get()
                ->map(fn (Level $level): array => [
                    'code' => $level->code->value,
                    'label' => $level->code->label(),
                    'modules' => $level->is($previewLevel)
                        ? $learningPath->modulesOfLevel($user, $level)
                        : [],
                ])
                ->all(),
            'selectedLevel' => $selectedLevel?->code->value,
            'defaultLevel' => $previewLevel->code->value,
        ]);
    }

    public function updateLevel(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'level' => ['required', Rule::in(Level::query()->pluck('code')->all())],
        ]);

        $request->user()->update(['learning_level' => $validated['level']]);

        return back();
    }
}
