<?php
header("Content-Type: application/xml; charset=utf-8");
// Fetch the dynamic sitemap from the backend
$sitemap = file_get_contents("https://nexa-backend-xyul.onrender.com/sitemap.xml");
if ($sitemap === FALSE) {
    http_response_code(500);
    echo "Error fetching sitemap";
} else {
    echo $sitemap;
}
?>
