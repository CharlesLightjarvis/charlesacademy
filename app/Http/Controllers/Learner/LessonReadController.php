<?php

namespace App\Http\Controllers\Learner;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\Module;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class LessonReadController extends Controller
{
    public function update(Request $request, Module $module, Lesson $lesson): RedirectResponse
    {
        abort_unless($module->is_active && $lesson->is_active, 404);

        $progress = LessonProgress::query()->firstOrCreate([
            'user_id' => $request->user()->id,
            'lesson_id' => $lesson->id,
        ]);

        $progress->is_read = ! $progress->is_read;
        $progress->save();

        return back();
    }
}
