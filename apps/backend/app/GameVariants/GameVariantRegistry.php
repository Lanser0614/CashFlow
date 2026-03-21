<?php

namespace App\GameVariants;

use App\GameVariants\Cashflow101Classic\Variant as Cashflow101ClassicVariant;
use App\GameVariants\Cashflow101Quick\Variant as Cashflow101QuickVariant;
use App\GameVariants\Cashflow202\Variant as Cashflow202Variant;
use App\GameVariants\Contracts\GameVariantDefinition;
use InvalidArgumentException;

class GameVariantRegistry
{
    /**
     * @return array<string, GameVariantDefinition>
     */
    public static function all(): array
    {
        static $variants = null;

        if ($variants === null) {
            $definitions = [
                new Cashflow101ClassicVariant(),
                new Cashflow101QuickVariant(),
                new Cashflow202Variant(),
            ];

            $variants = [];
            foreach ($definitions as $definition) {
                $variants[$definition->id()->value] = $definition;
            }
        }

        return $variants;
    }

    public static function get(GameVariant $variant): GameVariantDefinition
    {
        return self::all()[$variant->value];
    }

    public static function default(): GameVariantDefinition
    {
        return self::get(GameVariant::Cashflow101Classic);
    }

    public static function resolveOrFail(?string $value): GameVariantDefinition
    {
        $variant = GameVariant::fromInput($value);
        if ($variant === null) {
            throw new InvalidArgumentException('Unknown game variant.');
        }

        return self::get($variant);
    }
}
