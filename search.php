<?php
include 'db.php';

session_start();
$userId = $_SESSION['user_id'];
$searchTerm = $_POST['search_term'];
$result = $_POST['result'];

$query = "INSERT INTO searches (user_id, search_term, result) VALUES ('$userId', '$searchTerm', '$result')";
if (mysqli_query($conn, $query)) {
    echo "Search saved";
} else {
    echo "Error: " . $query . "<br>" . mysqli_error($conn);
}
?>
