<?php

namespace App\GameVariants\Cashflow101Quick;

use App\GameVariants\Contracts\GameVariantDefinition;
use App\GameVariants\GameVariant;

class Variant implements GameVariantDefinition
{
    public function id(): GameVariant
    {
        return GameVariant::Cashflow101Quick;
    }

    public function label(): string
    {
        return 'Cashflow 101 Quick';
    }

    public function allowedProfessionIds(): array
    {
        return ['teacher', 'engineer', 'nurse'];
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
