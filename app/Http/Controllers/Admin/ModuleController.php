<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ModuleRequest;
use App\Models\Level;
use App\Models\Module;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ModuleController extends Controller
{
    /**
     * List every module, ordered by the automatic order column.
     */
    public function index(): Response
    {
        return Inertia::render('admin/modules/index', [
            'modules' => Module::query()->ordered()->get(),
        ]);
    }

    /**
     * Show the form to create a module.
     */
    public function create(): Response
    {
        return Inertia::render('admin/modules/create', [
            'levels' => Level::query()->ordered()->get(['id', 'code', 'name']),
        ]);
    }

    /**
     * Store a new module: the slug and the order column are filled in automatically,
     * then the admin lands on the lessons tab to start adding lessons right away.
     */
    public function store(ModuleRequest $request): RedirectResponse
    {
        $module = Module::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Module créé.']);

        return to_route('admin.modules.edit', ['module' => $module, 'tab' => 'lecons']);
    }

    /**
     * Show the tabs of a module: its information form and its lessons.
     */
    public function edit(Module $module): Response
    {
        return Inertia::render('admin/modules/edit', [
            'module' => $module,
            'levels' => Level::query()->ordered()->get(['id', 'code', 'name']),
            'lessons' => $module->lessons()->ordered()->get(),
        ]);
    }

    /**
     * Update a module: the slug is never regenerated.
     */
    public function update(ModuleRequest $request, Module $module): RedirectResponse
    {
        $module->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Module mis à jour.']);

        return to_route('admin.modules.edit', ['module' => $module, 'tab' => 'infos']);
    }

    /**
     * Delete a module.
     */
    public function destroy(Module $module): RedirectResponse
    {
        $module->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Module supprimé.']);

        return to_route('admin.modules.index');
    }

    /**
     * Persist the new module order after a drag and drop.
     */
    public function reorder(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'distinct', 'exists:modules,id'],
        ]);

        Module::setNewOrder($validated['ids']);

        return back();
    }
}
