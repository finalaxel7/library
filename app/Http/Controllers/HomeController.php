<?php

namespace App\Http\Controllers;

use App\categories;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    //
    public function index()
    {
        $categories = categories::all();

        return view('index', [
            'categories' => $categories,
            'js' => [
                '/books.js'
            ]
        ]);
    }
}
