<?php

use App\Http\Controllers\HomeController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', 'HomeController@index');
Route::get('/categories/', 'CategoriesController@index');

Route::post('/categories', function () {
    $res = [
        'categories' => DB::select('select * from categories')
    ];
    header('Content-Type: application/json');
    die(json_encode($res));
});

Route::post('/new', function () {
    $res = ['error' => FALSE, 'message' => 'The Book has been saved'];
    $date = date('Y-m-d H:i:s');
    $datos = !empty($_POST['datos'])? (is_array($_POST['datos'])? $_POST['datos'] : false ) : false;
    if($datos){
        $result = DB::insert('insert into books (name, author, category, publish_date, user, created_at, updated_at) values (?, ?, ?, ?, ?, ?, ?)', 
        [$datos['name'], $datos['author'], $datos['category'], $datos['publish_date'], '', $date, $date]);
        DB::update('update categories set manybooks = manybooks + 1, updated_at = "'.$date.'" where id = ?', [$datos['category']]);
        $res['id'] = $result;
    }else{
        $res = ['error' => TRUE, 'message' => 'Book could not be saved.'];
    }
    header('Content-Type: application/json');
    die(json_encode($res));
});

Route::post('/edit', function () {
    $res = ['error' => FALSE, 'message' => 'The Book has been updated'];
    $date = date('Y-m-d H:i:s');
    $datos = !empty($_POST['datos'])? (is_array($_POST['datos'])? $_POST['datos'] : false ) : false;
    $id = !empty($_POST['id'])? intval($_POST['id']) : false;
    if($datos && $id){
        $or = DB::table('books')->where('id', $id)->get();
        DB::update('update categories set manybooks = manybooks - 1, updated_at = "'.$date.'" where id = '. $or[0]->id);
        $result = DB::table('books')->where('id', $id)->update(
            ['name' => $datos['name'], 'author' => $datos['author'], 'category' => $datos['category'], 'publish_date' => $datos['publish_date'], 'updated_at' => $date]
        );
        DB::update('update categories set manybooks = manybooks + 1, updated_at = "'.$date.'" where id = '. $datos['category']);
        if(!$result){
            $res = ['error' => TRUE, 'message' => 'Book could not be updated.'];
        }
    }else{
        $res = ['error' => TRUE, 'message' => 'Book could not be updated.'];
    }
    header('Content-Type: application/json');
    die(json_encode($res));
});

Route::post('/borrow', function () {
    $res = ['error' => FALSE, 'message' => ''];
    $date = date('Y-m-d H:i:s');
    $datos = !empty($_POST['datos'])? (is_array($_POST['datos'])? $_POST['datos'] : false ) : false;
    $id = !empty($_POST['id'])? intval($_POST['id']) : false;
    if($datos && $id){
        $result = DB::insert('insert into book_history (book_id, name, status, date, created_at, updated_at) values (?, ?, ?, ?, ?, ?)', 
        [$id, $datos['user'], 1, $datos['date'], $date, $date]);
        
        $result = DB::table('books')->where('id', $id)->update(
            ['user' => $datos['user']]
        );
        if(!$result){
            $res = ['error' => TRUE, 'message' => 'Book could not be updated.'];
        }
    }else{
        $res = ['error' => TRUE, 'message' => 'Book could not be mark as lend.'];
    }
    header('Content-Type: application/json');
    die(json_encode($res));
});

Route::post('/return', function () {
    $res = ['error' => FALSE, 'message' => ''];
    $date = date('Y-m-d H:i:s');
    $book_id = !empty($_POST['book_id'])? intval($_POST['book_id']) : false;
    $registry_id = !empty($_POST['registry_id'])? intval($_POST['registry_id']) : false;
    if($book_id && $registry_id){
        $result = DB::table('book_history')->where('id', $registry_id)->update(
            ['status' => 0,'updated_at' => $date]
        );
        $result = DB::table('books')->where('id', $book_id)->update(
            ['user' => '','updated_at' => $date]
        );
        if(!$result){
            $res = ['error' => TRUE, 'message' => 'Book could not be updated.'];
        }
    }else{
        $res = ['error' => TRUE, 'message' => 'Book could no be marked as returned.'];
    }
    header('Content-Type: application/json');
    die(json_encode($res));
});

Route::post('/delete', function () {
    $res = ['error' => FALSE, 'message' => 'The book has been deleted correctly.'];
    $id = !empty($_POST['id'])? intval($_POST['id']) : false;
    if($id){
        $or = DB::table('books')->where('id', $id)->get();
        DB::update('update categories set manybooks = manybooks - 1, updated_at = "'.$date.'" where id = ?', [$or[0]->id]);
        $result = DB::delete('DELETE FROM books WHERE id = ' . $id);
        if(!$result){
            $res = ['error' => TRUE, 'message' => 'Book could not be deleted.'];
        }
    }else{
        $res = ['error' => TRUE, 'message' => 'Book could not be deleted.'];
    }
    header('Content-Type: application/json');
    die(json_encode($res));
});

Route::post('/list', function () {
    $res = ['error' => FALSE, 'message' => ''];
    /*needed*/
    $limit = array_key_exists('num_results', $_POST) ? 'LIMIT ' . intval($_POST['num_results']) : 'LIMIT 50';
    $limit_number = array_key_exists('num_results', $_POST) ? intval($_POST['num_results']) : 50;
    $order = !empty($_POST['order'])? 'ORDER BY ' . $_POST['order'] : 'ORDER BY id DESC';
    $page_number = array_key_exists('page', $_POST) ? $_POST['page'] : 1;
    $page = "OFFSET " . (($page_number - 1) * $limit_number) . " ";
    $buscar = !empty($_POST["search"]) ? " AND (b.name like '%" . $_POST["search"] . "%' OR c.name like '%" . $_POST["search"] . "%' OR b.publish_date like '%" . $_POST["search"] . "%'  OR b.user like '%" . $_POST["search"] . "%')" : "";
    $categoria = !empty($_POST["category"]) ? " AND b.category = {$_POST['category']} " : "";

    /* QUERY */
    $query = 
        "SELECT 
            b.*,
            c.name AS category_name
        FROM books b 
            LEFT JOIN categories c
                ON b.category = c.id
        WHERE c.name IS NOT NULL
        {$categoria} {$buscar} {$order} {$limit} {$page}";

    $results = DB::select($query);
    $num_resultados = DB::select("SELECT count(*) as cont FROM (" . str_replace([$limit, $page], "", $query) . " ) AS aux_cont");
    $num_resultados = $num_resultados[0]->cont;
    if ($results) {
        $res["results"] = $results;
        $res["num_resultados"] = $num_resultados;
    } else {
        $res['error'] = TRUE;
        $res['message'] = 'No books where found';
    }
    header('Content-Type: application/json');
    die(json_encode($res));
});

Route::post('/history', function () {
    $res = ['error' => FALSE, 'message' => ''];
    /*needed*/
    $filter = intval($_POST['filter']);
    $limit = array_key_exists('num_results', $_POST) ? 'LIMIT ' . intval($_POST['num_results']) : 'LIMIT 5';
    $limit_number = array_key_exists('num_results', $_POST) ? intval($_POST['num_results']) : 5;
    $order = !empty($_POST['order'])? 'ORDER BY ' . $_POST['order'] : 'ORDER BY id DESC';
    
    /* QUERY */
    $query = 
        "SELECT 
            *
        FROM book_history 
        WHERE book_id = {$filter}
        {$order} {$limit}";
    $results = DB::select($query);
    $num_resultados = DB::select("SELECT count(*) as cont FROM (" . str_replace([$limit], "", $query) . " ) AS aux_cont");

    if ($results) {
        $res["results"] = $results;
        $res["num_resultados"] = $num_resultados;
    } else {
        $res['error'] = TRUE;
        $res['message'] = 'No borrowed history was found';
    }
    header('Content-Type: application/json');
    die(json_encode($res));
});

// Categories
Route::post('/new_c', function () {
    $res = ['error' => FALSE, 'message' => 'The Book has been saved'];
    $date = date('Y-m-d H:i:s');
    $datos = !empty($_POST['datos'])? (is_array($_POST['datos'])? $_POST['datos'] : false ) : false;
    if($datos){
        $result = DB::insert('insert into categories (name, description, manybooks, created_at, updated_at) values (?, ?, ?, ?, ?)', 
        [$datos['name'], $datos['description'], 0, $date, $date]);
        $res['id'] = $result;
    }else{
        $res = ['error' => TRUE, 'message' => 'Book could not be saved.'];
    }
    header('Content-Type: application/json');
    die(json_encode($res));
});

Route::post('/delete_c', function () {
    $res = ['error' => FALSE, 'message' => 'The book has been deleted correctly.'];
    $id = !empty($_POST['id'])? intval($_POST['id']) : false;
    if($id){
        $result = DB::delete('DELETE FROM categories WHERE id = ' . $id . ' AND manybooks <= 0');
        if(!$result){
            $res = ['error' => TRUE, 'message' => 'Book could not be deleted.'];
        }
    }else{
        $res = ['error' => TRUE, 'message' => 'Book could not be deleted.'];
    }
    header('Content-Type: application/json');
    die(json_encode($res));
});

Route::post('/list_c', function () {
    $res = ['error' => FALSE, 'message' => ''];
    /*needed*/
    $limit = array_key_exists('num_results', $_POST) ? 'LIMIT ' . intval($_POST['num_results']) : 'LIMIT 50';
    $limit_number = array_key_exists('num_results', $_POST) ? intval($_POST['num_results']) : 50;
    $order = !empty($_POST['order'])? 'ORDER BY ' . $_POST['order'] : 'ORDER BY id DESC';
    $page_number = array_key_exists('page', $_POST) ? $_POST['page'] : 1;
    $page = "OFFSET " . (($page_number - 1) * $limit_number) . " ";
    $buscar = !empty($_POST["search"]) ? " AND ( c.name like '%" . $_POST["search"] . "%' OR c.description like '%" . $_POST["search"] . "%')" : "";

    /* QUERY */
    $query = 
        "SELECT 
            *
        FROM categories c
        WHERE c.name IS NOT NULL
         {$buscar} {$order} {$limit} {$page}";

    $results = DB::select($query);
    $num_resultados = DB::select("SELECT count(*) as cont FROM (" . str_replace([$limit, $page], "", $query) . " ) AS aux_cont");
    $num_resultados = $num_resultados[0]->cont;
    if ($results) {
        $res["results"] = $results;
        $res["num_resultados"] = $num_resultados;
    } else {
        $res['error'] = TRUE;
        $res['message'] = 'No categories where found';
    }
    header('Content-Type: application/json');
    die(json_encode($res));
});