const htmlTemplate = `
<style>
body {
  font-family: Arial, sans-serif;
  text-align: center;
  padding: 50px;
}
a.button {
  background-color: #ED7E16;
  color: white;
  padding: 15px 32px;
  text-align: center;
  display: inline-block;
  font-size: 16px;
  font-weight: bold;
  margin: 4px 2px;
  cursor: pointer;
  text-decoration: none;
  border-radius: 15px;
}
.page-title {
  background-color: #ED7E16;
  color: white;
  padding: 0;
  text-align: center;
  font-size: 36px;
  margin: 0 1vw;
  width: 100%;
  height: 10vh;
}
.button-container {
  text-align: center;
  margin-top: 20px;
}
.custom-button {
  display: inline-block;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  margin: 4px 2px;
  background-color: #ED7E16;
  color: #fff;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  transition: background-color 0.3s;
}
.custom-button:hover {
  background-color: #BD3E00;
}
</style>

<!-- Bootstrap CSS -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM" crossorigin="anonymous">
<!-- Bootstrap JS -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" integrity="sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz" crossorigin="anonymous"></script>

<div class="page-title">Freee to Google Calendar Auto Sync</div>
`;