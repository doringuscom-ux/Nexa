<?php
header("Content-Type: text/xsl; charset=utf-8");
// Fetch the dynamic sitemap stylesheet from the backend
$xsl = file_get_contents("https://nexa-backend-xyul.onrender.com/sitemap.xsl");
if ($xsl === FALSE) {
    http_response_code(500);
    echo "Error fetching sitemap stylesheet";
} else {
    echo $xsl;
}
?>
