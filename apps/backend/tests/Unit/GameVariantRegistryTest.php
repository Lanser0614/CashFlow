<?php

namespace Tests\Unit;

use App\GameVariants\GameVariant;
use App\GameVariants\GameVariantRegistry;
use PHPUnit\Framework\TestCase;

class GameVariantRegistryTest extends TestCase
{
    public function test_it_normalizes_legacy_and_canonical_values(): void
    {
        $this->assertSame(GameVariant::Cashflow101Classic, GameVariant::fromInput('classic'));
        $this->assertSame(GameVariant::Cashflow101Quick, GameVariant::fromInput('quick'));
        $this->assertSame(GameVariant::Cashflow202, GameVariant::fromInput('cashflow202'));
    }

    public function test_registry_exposes_expected_variant_metadata(): void
    {
        $variant = GameVariantRegistry::get(GameVariant::Cashflow202);

        $this->assertSame('cashflow202', $variant->id()->value);
        $this->assertTrue($variant->allowsOnline());
        $this->assertContains('teacher', $variant->allowedProfessionIds());
    }
}
