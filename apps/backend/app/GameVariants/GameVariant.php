<?php

namespace App\GameVariants;

enum GameVariant: string
{
    case Cashflow101Classic = 'cashflow101_classic';
    case Cashflow101Quick = 'cashflow101_quick';
    case Cashflow202 = 'cashflow202';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_map(
            static fn (self $variant) => $variant->value,
            self::cases(),
        );
    }

    public static function fromInput(?string $value): ?self
    {
        return match ($value) {
            null, '', 'classic', self::Cashflow101Classic->value => self::Cashflow101Classic,
            'quick', self::Cashflow101Quick->value => self::Cashflow101Quick,
            self::Cashflow202->value => self::Cashflow202,
            default => null,
        };
    }
}
