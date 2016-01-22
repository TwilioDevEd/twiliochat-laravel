@extends('layouts.master')

@section('title')
    Twilio Chat
@endsection

@section('content')
  <div class="container-fluid">
      <div class="row">
          <div class="col-md-4"></div>
          <div class="col-md-4">
              <h1 id="header">Twilio Chat</h1>
          </div>
          <div class="col-md-4"></div>
      </div>
      <div id="container" class="row">
          <div class="col-md-2"></div>
          <div class="col-md-2">
              <div class="row">
                  <h3>Channel List</h3>
              </div>
          </div>
          <div id="chat_window" class="col-md-4">
              <div id="message_list" class="row"></div>
              <div id="input_div" class="row">
                  <textarea id="input_text" type="text" placeholder="   Your message"></textarea>
              </div>
          </div>
          <div class="col-md-4"></div>
      </div>
  </div>
@endsection
