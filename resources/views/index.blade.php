@extends('master')

@section('title', 'Books')

@section('view', 'vue-books')

@section('js')
@if ($js)
@foreach ($js as $j)
<script src="{{ URL::asset('js') . $j }}"></script>
@endforeach
@endif
@endsection

@section('content')
<div class="container-fluid">

    <!-- Page Heading -->
    <div class="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0 text-gray-800">Books</h1>
        <a @click.prevent="new_book()" href="#" class="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm">
            <i class="fas fa-plus fa-sm text-white-50"></i> New Book
        </a>
    </div>


    <!-- Content Row -->

    <div class="row">

        <!-- Pie Chart -->
        <div class="col-12">
            <div class="card shadow mb-4">
                <!-- Card Header - Dropdown -->
                <pag-table ref="list" inline-template action='/list' order_in='id DESC' init_page="1" v-cloak>
                    <div class="mt-3">
                        <div class="container-fluid">
                            <div class="row">
                                <div class="col-12 p-0">
                                    <div class="form-group">
                                        <select v-select2="others.category" name="datos[category]" class="form-control"
                                            placeholder="Category" data-onchange="change()">
                                            <option value="">ALL</option>
                                            <option v-for="cat in categories" :value="cat.id">@{{cat.name}} -
                                                @{{cat.description}}</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-12 p-0">
                                    <div class="input-group">
                                        <input v-model="buscar" @change="change" type="text"
                                            class="form-control bg-light border-0 small" placeholder="Search for...">
                                        <div class="input-group-append">
                                            <button class="btn btn-primary" type="button">
                                                <i class="fas fa-search fa-sm"></i>
                                            </button>
                                        </div>
                                        <div class="input-group-append">
                                            <button class="btn btn-default" type="button" title="Refresh"
                                                @click="change">
                                                <span class="icon fas fa-sync-alt"></span>
                                            </button>
                                        </div>
                                        <div class="input-group-append">
                                            <div class="dropdown btn-group">
                                                <button class="btn btn-default dropdown-toggle" type="button"
                                                    data-toggle="dropdown" aria-expanded="false">
                                                    <span class="dropdown-text">@{{limit_number}}</span><span
                                                        class="caret"></span>
                                                </button>
                                                <ul class="dropdown-menu pull-right" role="menu">
                                                    <li class="active" aria-selected="true">
                                                        <a data-action="10" class="dropdown-item dropdown-item-button"
                                                            @click="limit_number = 10">10</a>
                                                    </li>
                                                    <li aria-selected="false">
                                                        <a data-action="25" class="dropdown-item dropdown-item-button"
                                                            @click="limit_number = 25">25</a>
                                                    </li>
                                                    <li aria-selected="false">
                                                        <a data-action="50" class="dropdown-item dropdown-item-button"
                                                            @click="limit_number = 50">50</a>
                                                    </li>
                                                    <li aria-selected="false">
                                                        <a data-action="-1" class="dropdown-item dropdown-item-button"
                                                            @click="limit_number = 200">All</a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                        <div class="col-sm-12 table-responsive">
                            <table class="table-condensed bootgrid-table table table-loader">
                                <thead>
                                    <tr class="table-header">
                                        <template>
                                            <t-header title="Name" variable="b.name" classes="" :comp="order_val">
                                            </t-header>
                                            <t-header title="Author" variable="b.author" classes="" :comp="order_val">
                                            </t-header>
                                            <t-header title="Category" variable="c.name" classes="" :comp="order_val">
                                            </t-header>
                                            <t-header title="Publish date" variable="b.publish_date" classes=""
                                                :comp="order_val"></t-header>
                                            <t-header title="Available" variable="b.user" classes="" :comp="order_val">
                                            </t-header>
                                        </template>
                                        <th class="small-td-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-if="error">
                                        <td colspan="6" class="v-align-middle text-center">@{{msg}}</td>
                                    </tr>
                                    <template v-for="(result, i) in results">
                                        <tr v-bind:class="'resultado_'+result.id" v-bind:data-id="result.id">
                                            <td class="v-align-middle">
                                                <p>@{{result.name}}</p>
                                            </td>
                                            <td class="v-align-middle">
                                                <p>@{{result.author}}</p>
                                            </td>
                                            <td class="v-align-middle  text-center">
                                                <p>@{{result.category_name}}</p>
                                            </td>
                                            <td class="v-align-middle">
                                                <p>@{{result.publish_date}}</p>
                                            </td>
                                            <td class="v-align-middle">
                                                <i class="fas "
                                                    :class="{'fa-times':result.user != '', 'fa-check':result.user == ''}"></i>
                                            </td>
                                            <td width="20%"
                                                class="v-align-middle s-td-actions small-td-3 content-right">
                                                <button v-tooltipster title="See book info"
                                                    @click.prevent="call_parent('see_book',result)"
                                                    class="btn btn-primary"><i class="fas fa-edit"></i></button>
                                                <button v-if="result.user == ''" v-tooltipster
                                                    title="Mark as unavailable"
                                                    @click.prevent="call_parent('borrow',result)"
                                                    class="btn btn-primary"><i class="fas fa-book"></i>
                                                </button>
                                                <button v-tooltipster title="Mark as unavailable"
                                                    @click.prevent="call_parent('delete',result)"
                                                    class="btn btn-danger"><i class="fas fa-times"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    </template>
                                </tbody>
                            </table>
                        </div>
                        <div class="row bootgrid-footer container-fluid">
                            <div class="col-sm-6">
                                <ul class="pagination">
                                    <li class="first" :class="{'disabled' : page > 1} " @click="first()">
                                        <a data-page="first" class="btn">«</a>
                                    </li>
                                    <li class="prev" :class="{'disabled' : page > 1} " @click="prev()">
                                        <a data-page="prev" class="btn">&lt;</a>
                                    </li>
                                    <li v-for="pagina in controlers.pages" class="page"
                                        v-bind:class="{'active' : (page == pagina.number)}" v-on:click="change_page">
                                        <a class="btn">@{{pagina.number}}</a>
                                    </li>
                                    <li class="next">
                                        <a data-page="next" class="btn" @click="next()">&gt;</a>
                                    </li>
                                    <li class="last">
                                        <a data-page="last" class="btn" @click="last()">»</a>
                                    </li>
                                </ul>
                            </div>
                            <div class="col-sm-6 ">
                                <div class="text-lg-right">
                                    @{{controlers.msg}}
                                </div>
                            </div>
                        </div>
                    </div>
                </pag-table>
            </div>
        </div>
    </div>
    <!-- Content Row -->
</div>
<!-- /.container-fluid -->
@endsection

@section('modals')

<div class="modal fade" id="new" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">@{{id? (view? '' : 'Edit' ) : 'Save'}} Book</h5>
                <button class="close" type="button" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">×</span>
                </button>
            </div>
            <form @submit.prevent="confirmNew($event)" class="col-12">
                <div class="row">
                    <div class="col-sm-6 mb-3 mb-sm-0">
                        <div class="form-group">
                            <label for="">Name</label>
                            <input name="datos[name]" v-model="datos.name" type="text" class="form-control"
                                placeholder="Name" required :readonly="view && id != 0">
                        </div>
                    </div>
                    <div class=" col-sm-6">
                        <div class="form-group">
                            <label for="">Author</label>
                            <input name="datos[author]" v-model="datos.author" type="text" class="form-control"
                                placeholder="Author" required :readonly="view && id != 0">
                        </div>
                    </div>
                </div>
                <div class=" row">
                    <div class="col-sm-6 mb-3 mb-sm-0">
                        <div class="form-group">
                            <label for="">Category</label>
                            <select v-select2="datos.category" name="datos[category]" class="form-control"
                                placeholder="Category" :disabled="view && id != 0">
                                <option v-for="cat in categories" :value="cat.id">@{{cat.name}}</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-sm-6 mb-3 mb-sm-0">
                        <div class="form-group">
                            <label for="">Publish Date</label>
                            <input name="datos[publish_date]" v-model="datos.publish_date" type="date"
                                class="form-control" placeholder="Publication date" :readonly="view && id != 0">

                        </div>
                    </div>
                </div>
                <div v-if="id !=0" class="row">
                    <pag-table ref="hist" inline-template action='/history' order_in='id DESC' init_page="1"
                        :filter="id" v-cloak>
                        <div class="col-sm-12 table-responsive">
                            <table class="table-condensed bootgrid-table table table-loader">
                                <thead>
                                    <tr class="table-header">
                                        <th>User</th>
                                        <th>Borrowed from</th>
                                        <th>Returned on</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-if="error">
                                        <td colspan="6" class="v-align-middle text-center">@{{msg}}
                                        </td>
                                    </tr>
                                    <template v-for="(result, i) in results">
                                        <tr v-bind:class="'resultado_'+result.id" v-bind:data-id="result.id">
                                            <td class="v-align-middle">
                                                <p>@{{result.name}}</p>
                                            </td>
                                            <td class="v-align-middle">
                                                <p>@{{result.date}}</p>
                                            </td>
                                            <td class="content-right">
                                                <button v-if="result.status == 1" v-tooltipster title="Return book"
                                                    @click.prevent="call_parent('return_book',result)"
                                                    class="btn btn-primary"><i class="fas fa-undo"></i></button>
                                                <p v-else> @{{result.updated_at}}</p>
                                            </td>
                                        </tr>
                                    </template>
                                </tbody>
                            </table>
                        </div>
                    </pag-table>
                </div>
                <div class="modal-footer">
                    <template v-if="id">
                        <input type="hidden" name="id" :value="id">
                        <button v-if="view && id != 0" @click.prevent="view = false"
                            class="btn btn-primary btn-user btn-bloc" type="button">Make edit</button>
                        <template v-else>
                            <button @click.prevent="view = true" class="btn btn-danger btn-user btn-bloc"
                                type="button">Cancel edit</button>
                            <button class="btn btn-primary btn-user btn-bloc" type="submit">Edit</button>
                        </template>
                    </template>
                    <button v-else class="btn btn-primary btn-user btn-bloc" type="submit">Save</button>
                </div>
            </form>
        </div>
    </div>
</div>
<div class="modal fade" id="borrow" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Mark book as borrow?</h5>
                <button class="close" type="button" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">×</span>
                </button>
            </div>
            <form @submit.prevent="confirmBorrow($event)">
                <div class="modal-body">
                    <div class="row">
                        <div class="col-sm-6 mb-3 mb-sm-0">
                            <div class="form-group">
                                <label for="">User Name</label>
                                <input name="datos[user]" v-model="datos.name" type="text" class="form-control"
                                    placeholder="User Name" required>
                            </div>
                        </div>
                        <div class=" col-sm-6">
                            <div class="form-group">
                                <label for="">Date</label>
                                <input name="datos[date]" v-model="datos.author" type="date" class="form-control"
                                    placeholder="Author" required>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <input type="hidden" name="id" :value="id">
                    <button class="btn btn-secondary" type="button" data-dismiss="modal">Cancel</button>
                    <button class="btn btn-primary" type="submit">Mark</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
