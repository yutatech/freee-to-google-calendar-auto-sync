const htmlTemplate = `
<!-- Bootstrap CSS -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM" crossorigin="anonymous">
<!-- Bootstrap JS -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" integrity="sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz" crossorigin="anonymous"></script>

<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>

<style>
body {
  font-family: Arial, sans-serif;
  text-align: center;
  padding: 0px;
}

:root {
  --bs-light-rgb: 237,126,22;
  --bs-secondary-rgb: 173,181,189;
}

h6, .h6, h5, .h5, h4, .h4, h3, .h3, h2, .h2, h1, .h1 {
  font-weight: 800;
}

.navbar {
  --bs-navbar-color: white;
  --bs-navbar-hover-color: white;
  --bs-navbar-disabled-color: white;
  --bs-navbar-active-color: white;
  --bs-navbar-brand-padding-y: 0.3125rem;
  --bs-navbar-brand-margin-end: 1rem;
  --bs-navbar-brand-font-size: 1.3rem;
  --bs-navbar-brand-color: white;
  --bs-navbar-brand-hover-color: white;
}

.navbar-brand {
  font-weight: 800;
  padding: 0;
  margin: 0;
}

.navbar-text {
  padding: 0;
  margin: 0;
}

.btn-primary {
  --bs-btn-color: #fff;
  --bs-btn-bg: #ED7E16;
  --bs-btn-border-color: #ED7E16;
  --bs-btn-hover-color: #fff;
  --bs-btn-hover-bg: #DE550D;
  --bs-btn-hover-border-color: #DE550D;
  --bs-btn-focus-shadow-rgb: 189, 62, 0;
  --bs-btn-active-color: #fff;
  --bs-btn-active-bg: #BD3E00;
  --bs-btn-active-border-color: #BD3E00;
  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  --bs-btn-disabled-color: #fff;
  --bs-btn-disabled-bg: #ED7E16;
  --bs-btn-disabled-border-color: #ED7E16;
}

.btn-outline-primary {
  --bs-btn-color: #ED7E16;
  --bs-btn-border-color: #ED7E16;
  --bs-btn-hover-color: #fff;
  --bs-btn-hover-bg: #ED7E16;
  --bs-btn-hover-border-color: #ED7E16;
  --bs-btn-focus-shadow-rgb: 189, 62, 0;
  --bs-btn-active-color: #fff;
  --bs-btn-active-bg: #BD3E00;
  --bs-btn-active-border-color: #BD3E00;
  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  --bs-btn-disabled-color: #ED7E16;
  --bs-btn-disabled-bg: transparent;
  --bs-btn-disabled-border-color: #ED7E16;
  --bs-gradient: none;
}

.dropdown-menu {
  --bs-dropdown-color: #212529;
  --bs-dropdown-bg: #fff;
  --bs-dropdown-link-color: #212529;
  --bs-dropdown-link-hover-color: #1e2125;
  --bs-dropdown-link-hover-bg: #e9ecef;
  --bs-dropdown-link-active-color: #fff;
  --bs-dropdown-link-active-bg: #ED7E16;
  --bs-dropdown-link-disabled-color: #adb5bd;
}

.form-select {
  color: #212529;
  background-color: #fff;
  border: 1px solid #ED7E16;
}

.form-select:focus {
  border-color: #ED7E16;
  outline: 0;
  box-shadow: 0 0 0 0.25rem rgba(237, 126, 22, 0.25);
}
.form-select:disabled {
  border-color: rgba(237, 126, 22, 0.25);
}

.form-control {
  color: #212529;
  background-color: #fff;
  border: 1px solid #ED7E16;
}

.form-control:focus {
  border-color: #ED7E16;
  outline: 0;
  box-shadow: 0 0 0 0.25rem rgba(237, 126, 22, 0.25);
}

.form-control:disabled {
  border-color: rgba(237, 126, 22, 0.25);
}

.form-check-input:focus {
  border-color: #ED7E16;
  outline: 0;
  box-shadow: 0 0 0 0.25rem rgba(237, 126, 22, 0.25);
}
.form-check-input:checked {
  background-color: #ED7E16;
  border-color: #ED7E16;
}

.form-switch .form-check-input {
  width: 3em;
  height: 1.5em;
  margin-left: -2.5em;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='rgba%280, 0, 0, 0.25%29'/%3e%3c/svg%3e");
  background-position: left center;
  border-radius: 0.75em;
  transition: background-position 0.15s ease-in-out;
}

.form-switch .form-check-input:focus {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='rgba%28237,126,22, 0.8%29'/%3e%3c/svg%3e");
}

.form-switch .form-check-input:checked {
  background-position: right center;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='%23fff'/%3e%3c/svg%3e");
}

.input-form {
  margin: 20px;
}

.border-light {
  --bs-border-opacity: 1;
  border-color: rgba(var(--bs-light-rgb), var(--bs-border-opacity)) !important;
}

.border-secondary {
  --bs-border-opacity: 1;
  border-color: rgba(var(--bs-secondary-rgb), var(--bs-border-opacity)) !important;
}

.round-rect {
  border-style: solid;
  border-radius: 1rem;
}
.custom-min-width {
  min-width: 384px;
}
</style>

<nav class="navbar navbar-expand-lg bg-light custom-min-width">
  <div class="vstack">
    <p class="navbar-brand" >Freee to Google Calendar Auto Sync</p>
    <div class="hstack">
      <p class="ms-auto"></p>
      <p class="navbar-text " style="padding-right: 1rem">現在のユーザー: </p>
      <p class="navbar-text" style="padding-right: 1rem" id="currentUser">who@gmail.com</p>
    </div>
  </div>
</nav>
`;