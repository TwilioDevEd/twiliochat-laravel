<?php
Route::get(
    '/', ['as' => 'home', function () {
        return response()->view('index');
    }]
);

Route::post(
    '/token',
    ['uses' => 'TokenController@generate', 'as' => 'token-generate']
);
