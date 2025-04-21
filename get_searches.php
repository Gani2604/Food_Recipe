<?php
include 'db.php';

session_start();
$userId = $_SESSION['user_id'];

$query = "SELECT * FROM searches WHERE user_id='$userId'";
$result = mysqli_query($conn, $query);

$searches = [];
while ($row = mysqli_fetch_assoc($result)) {
    $searches[] = $row;
}

echo json_encode($searches);
?>
