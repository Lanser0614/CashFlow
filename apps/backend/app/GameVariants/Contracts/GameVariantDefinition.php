<?php

namespace App\GameVariants\Contracts;

use App\GameVariants\GameVariant;

interface GameVariantDefinition
{
    public function id(): GameVariant;

    public function label(): string;

    /**
     * @return list<string>
     */
    public function allowedProfessionIds(): array;

    public function defaultProfessionId(): string;

    public function allowsOnline(): bool;
}
