<?php

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class MainTest extends TestCase
{
    /**
     * A basic functional test example.
     *
     * @return void
     */
    public function testPageShows()
    {
      $this->visit('/')
           ->see('Twilio Chat');
    }
}
