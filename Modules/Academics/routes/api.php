<?php

use Illuminate\Support\Facades\Route;
use Modules\Academics\Http\Controllers\AcademicPeriodController;
use Modules\Academics\Http\Controllers\ClassScheduleController;
use Modules\Academics\Http\Controllers\GradeController;
use Modules\Academics\Http\Controllers\SubjectController;

Route::middleware('auth:sanctum')->prefix('v1/academics')->group(function () {
    // Períodos académicos
    Route::get('periods/current', [AcademicPeriodController::class, 'current']);
    Route::apiResource('periods', AcademicPeriodController::class);

    // Materias
    Route::apiResource('subjects', SubjectController::class);

    // Horario semanal y clases
    Route::get('schedules/weekly', [ClassScheduleController::class, 'weekly']);
    Route::post('schedules', [ClassScheduleController::class, 'store']);
    Route::delete('schedules/{schedule}', [ClassScheduleController::class, 'destroy']);

    // Calificaciones
    Route::post('subjects/{subject}/grades', [GradeController::class, 'store']);
    Route::put('grades/{grade}', [GradeController::class, 'update']);
    Route::delete('grades/{grade}', [GradeController::class, 'destroy']);
});
