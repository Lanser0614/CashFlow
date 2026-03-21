<?php

namespace App\GameVariants\Cashflow202;

use App\GameVariants\Contracts\GameVariantDefinition;
use App\GameVariants\GameVariant;

class Variant implements GameVariantDefinition
{
    public function id(): GameVariant
    {
        return GameVariant::Cashflow202;
    }

    public function label(): string
    {
        return 'Cashflow 202';
    }

    public function allowedProfessionIds(): array
    {
        return [
            'teacher',
            'engineer',
            'nurse',
            'cop',
            'manager',
            'truck_driver',
            'secretary',
            'janitor',
            'lawyer',
            'doctor',
            'pilot',
        ];
    }

    public function defaultProfessionId(): string
    {
        return 'teacher';
    }

    public function allowsOnline(): bool
    {
        return true;
    }
}
