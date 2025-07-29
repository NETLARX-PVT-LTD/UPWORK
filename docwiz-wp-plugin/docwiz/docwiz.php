<?php
/*
Plugin Name: DocWiz - PDF Tools
Description: A simple PDF merge tool for demonstration purposes. (Dummy API Integration)
Version: 1.2
Author: Rohini Dawange
*/

// Prevent direct access to the file.
if (! defined('ABSPATH')) {
    exit;
}

// =========================================================
// !!! IMPORTANT: Library Includes !!!
// These paths MUST match the file structure set up in Step 1.
// =========================================================

// Include FPDF library FIRST, as FPDI extends FPDF.
// Include FPDF library FIRST, as FPDI extends FPDF.
require_once plugin_dir_path(__FILE__) . 'libs/fpdf/fpdf.php'; // Line 8

// Include FPDI library (which will now find FPDF correctly).
require_once plugin_dir_path(__FILE__) . 'libs/fpdi/src/autoload.php'; // Line 11

// Essential for FPDI 2.x+ to correctly use the FPDI class with namespaces.
use setasign\Fpdi\Fpdi;

// =========================================================
// END Library Includes
// =========================================================

/**
 * Enqueue necessary scripts (jQuery and our custom JS).
 */
function dw_enqueue_scripts()
{
    // Correctly loading custom.js from the 'js' folder
    wp_enqueue_script('dw-custom-js', plugins_url('js/custom.js', __FILE__), array('jquery'), '1.0', true);

    // Localize the script with AJAX URL and nonces for security
    wp_localize_script('dw-custom-js', 'dw_ajax', array(
        'ajaxurl'        => admin_url('admin-ajax.php'),
        'merge_nonce'    => wp_create_nonce('dw_merge_nonce'),
        'split_nonce'    => wp_create_nonce('dw_split_nonce'),
        'compress_nonce' => wp_create_nonce('dw_compress_nonce'),
        'rotate_nonce'   => wp_create_nonce('dw_rotate_nonce'),
        'delete_pages_nonce' => wp_create_nonce('dw_delete_pages_nonce'),
        'reorder_pages_nonce' => wp_create_nonce('dw_reorder_pages_nonce'),
        'pdf_to_jpg_nonce' => wp_create_nonce('dw_pdf_to_jpg_nonce'), // <-- Add this line
        'add_watermark_nonce' => wp_create_nonce('dw_add_watermark_nonce'),
        'word_to_pdf_nonce' => wp_create_nonce('dw_word_to_pdf_nonce'),
        'pdf_to_text_nonce' => wp_create_nonce('dw_pdf_to_text_nonce'),
        'repair_pdf_nonce' => wp_create_nonce('dw_repair_pdf_nonce'),
        'pdf_to_html_nonce' => wp_create_nonce('dw_pdf_to_html_nonce'),
        'pdf_to_grayscale_nonce' => wp_create_nonce('dw_pdf_to_grayscale_nonce'),
        'pdf_to_pdfa_nonce' => wp_create_nonce('dw_pdf_to_pdfa_nonce'),
        'add_page_numbers_nonce' => wp_create_nonce('dw_add_page_numbers_nonce'),
        'unlock_pdf_nonce' => wp_create_nonce('dw_unlock_pdf_nonce'),
        'sign_pdf_nonce' => wp_create_nonce('dw_sign_pdf_nonce'),
        'organize_pdf_nonce' => wp_create_nonce('dw_organize_pdf_nonce')
    ));
}
add_action('wp_enqueue_scripts', 'dw_enqueue_scripts');

/**
 * Enqueue Font Awesome for icons.
 */
function dw_enqueue_font_awesome()
{
    wp_enqueue_style('font-awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css', array(), '6.5.2', 'all');
}
add_action('wp_enqueue_scripts', 'dw_enqueue_font_awesome');

/**
 * Shortcode to display the Add Page Number form.
 */
function dw_add_page_numbers_form_shortcode()
{
    ob_start();
?>
    <div id="add-page-numbers-app" style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,.1);">
        <h2>Add Page Numbers to PDF</h2>
        <p>Upload a PDF file to add page numbers.</p>
        <form id="add-page-numbers-form" enctype="multipart/form-data">
            <div style="margin-bottom: 15px;">
                <label for="pdf_file_page_numbers" style="display: block; font-weight: bold; margin-bottom: 5px;">Upload PDF File:</label>
                <input type="file" id="pdf_file_page_numbers" name="pdf_file" accept="application/pdf" required
                    style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
            </div>
            <div style="margin-bottom: 15px;">
                <label for="position" style="display: block; font-weight: bold; margin-bottom: 5px;">Position:</label>
                <select id="position" name="position" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                    <option value="bottom-right">Bottom Right</option>
                    <option value="bottom-center">Bottom Center</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="top-right">Top Right</option>
                    <option value="top-center">Top Center</option>
                    <option value="top-left">Top Left</option>
                </select>
            </div>
            <button type="submit" style="background-color: #007bff; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer;">
                Add Page Numbers
            </button>
        </form>
        <div id="add-page-numbers-status" style="margin-top: 15px; font-weight: bold;"></div>
        <div id="download-page-numbered-pdf-container" style="margin-top: 15px; display: none;">
            <a id="download-page-numbered-pdf" href="#" download style="background-color: #28a745; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">
                Download PDF with Page Numbers
            </a>
        </div>
    </div>
<?php
    return ob_get_clean();
}
add_shortcode('dw_add_page_numbers_tool', 'dw_add_page_numbers_form_shortcode');

/**
 * Shortcode to display the PDF merge form.
 */
function dw_merge_form_shortcode()
{
    ob_start();
?>
    <div id="pdf-merge-app" style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,.1);">
        <h2>Merge PDFs</h2>
        <p>Select two or more PDF files to combine them into one.</p>
        <form id="pdf-merge-form" enctype="multipart/form-data">
            <div style="margin-bottom: 15px;">
                <label for="pdf_files" style="display: block; font-weight: bold; margin-bottom: 5px;">Upload PDF Files:</label>
                <input type="file" id="pdf_files" name="pdf_files[]" accept="application/pdf" multiple required
                    style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                <small style="color: #666;">Hold Ctrl/Cmd to select multiple files.</small>
            </div>
            <button type="submit" style="background-color: #007bff; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer;">
                Merge PDFs
            </button>
        </form>
        <div id="merge-status" style="margin-top: 15px; font-weight: bold;"></div>
        <div id="download-merged-pdf-container" style="margin-top: 15px; display: none;">
            <a id="download-merged-pdf" href="#" download style="background-color: #28a745; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">
                Download Merged PDF
            </a>
        </div>
    </div>
<?php
    return ob_get_clean();
}
add_shortcode('dw_merge_tool', 'dw_merge_form_shortcode');

/**
 * Shortcode to display the PDF to HTML (via Images) conversion form.
 */
function dw_pdf_to_html_form_shortcode()
{
    ob_start();
?>
    <div id="pdf-to-html-app" style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,.1);">
        <h2>PDF to HTML</h2>
        <p>Convert your PDF documents into web-friendly HTML pages (each page will be an image).</p>
        <form id="pdf-to-html-form" enctype="multipart/form-data">
            <div style="margin-bottom: 15px;">
                <label for="pdf_file_html" style="display: block; font-weight: bold; margin-bottom: 5px;">Upload PDF File:</label>
                <input type="file" id="pdf_file_html" name="pdf_file" accept=".pdf" required
                    style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
            </div>
            <button type="submit" style="background-color: #007bff; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer;">
                Convert to HTML
            </button>
        </form>
        <div id="pdf-to-html-status" style="margin-top: 15px; font-weight: bold;"></div>
        <div id="download-pdf-to-html-container" style="margin-top: 15px; display: none;">
            <a id="download-pdf-to-html" href="#" download style="background-color: #28a745; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">
                Download HTML File
            </a>
        </div>
    </div>
<?php
    return ob_get_clean();
}
add_shortcode('dw_pdf_to_html_tool', 'dw_pdf_to_html_form_shortcode');
/**
 * Shortcode to display the PDF split form.
 */
function dw_split_form_shortcode()
{
    ob_start();
?>
    <div id="pdf-split-app" style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,.1);">
        <h2>Split PDF</h2>
        <p>Upload a PDF to split it into individual pages.</p>
        <form id="pdf-split-form" enctype="multipart/form-data">
            <div style="margin-bottom: 15px;">
                <label for="split_pdf_file" style="display: block; font-weight: bold; margin-bottom: 5px;">Upload PDF File:</label>
                <input type="file" id="split_pdf_file" name="pdf_file" accept="application/pdf" required
                    style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
            </div>
            <button type="submit" style="background-color: #007bff; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer;">
                Split PDF
            </button>
        </form>
        <div id="split-status" style="margin-top: 15px; font-weight: bold;"></div>
        <div id="download-split-pdfs-container" style="margin-top: 15px; display: none;">
        </div>
    </div>
<?php
    return ob_get_clean();
}
add_shortcode('dw_split_tool', 'dw_split_form_shortcode');


/**
 * Shortcode to display the PDF compress form.
 */
function dw_compress_form_shortcode()
{
    ob_start();
?>
    <div id="pdf-compress-app" style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,.1);">
        <h2>Compress PDF</h2>
        <p>Upload a PDF to reduce its file size.</p>
        <form id="pdf-compress-form" enctype="multipart/form-data">
            <div style="margin-bottom: 15px;">
                <label for="compress_pdf_file" style="display: block; font-weight: bold; margin-bottom: 5px;">Upload PDF File:</label>
                <input type="file" id="compress_pdf_file" name="pdf_file" accept="application/pdf" required
                    style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
            </div>
            <button type="submit" style="background-color: #007bff; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer;">
                Compress PDF
            </button>
        </form>
        <div id="compress-status" style="margin-top: 15px; font-weight: bold;"></div>
        <div id="download-compressed-pdf-container" style="margin-top: 15px; display: none;">
            <a id="download-compressed-pdf" href="#" download style="background-color: #28a745; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">
                Download Compressed PDF
            </a>
        </div>
    </div>
<?php
    return ob_get_clean();
}
add_shortcode('dw_compress_tool', 'dw_compress_form_shortcode');

/**
 * Shortcode to display the PDF to JPG conversion form.
 */
function dw_pdf_to_jpg_form_shortcode()
{
    ob_start();
?>
    <div id="pdf-to-jpg-app" style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,.1);">
        <h2>Convert PDF to JPG</h2>
        <p>Upload a PDF to convert its pages into JPG images.</p>
        <form id="pdf-to-jpg-form" enctype="multipart/form-data">
            <div style="margin-bottom: 15px;">
                <label for="pdf_to_jpg_file" style="display: block; font-weight: bold; margin-bottom: 5px;">Upload PDF File:</label>
                <input type="file" id="pdf_to_jpg_file" name="pdf_file" accept="application/pdf" required
                    style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
            </div>
            <div style="margin-bottom: 15px;">
                <label for="jpg_quality" style="display: block; font-weight: bold; margin-bottom: 5px;">JPG Quality (1-100):</label>
                <input type="number" id="jpg_quality" name="jpg_quality" value="90" min="1" max="100"
                    style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
            </div>
            <button type="submit" style="background-color: #007bff; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer;">
                Convert to JPG
            </button>
        </form>
        <div id="pdf-to-jpg-status" style="margin-top: 15px; font-weight: bold;"></div>
        <div id="download-jpg-container" style="margin-top: 15px; display: none;">
            <p>Download your JPG images:</p>
            <div id="jpg-download-links"></div>
        </div>
    </div>
<?php
    return ob_get_clean();
}
add_shortcode('dw_pdf_to_jpg_tool', 'dw_pdf_to_jpg_form_shortcode');


/**
 * Shortcode to display the Add Watermark to PDF form.
 */
function dw_add_watermark_form_shortcode()
{
    ob_start();
?>
    <div id="pdf-add-watermark-app" style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,.1);">
        <h2>Add Watermark to PDF</h2>
        <p>Upload a PDF file and add a text watermark to its pages.</p>
        <form id="pdf-add-watermark-form" enctype="multipart/form-data">
            <div style="margin-bottom: 15px;">
                <label for="watermark_pdf_file" style="display: block; font-weight: bold; margin-bottom: 5px;">Upload PDF File:</label>
                <input type="file" id="watermark_pdf_file" name="pdf_file" accept="application/pdf" required
                    style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
            </div>
            <div style="margin-bottom: 15px;">
                <label for="watermark_text" style="display: block; font-weight: bold; margin-bottom: 5px;">Watermark Text:</label>
                <input type="text" id="watermark_text" name="watermark_text" required placeholder="e.g., CONFIDENTIAL"
                    style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
            </div>
            <div style="margin-bottom: 15px;">
                <label for="font_size" style="display: block; font-weight: bold; margin-bottom: 5px;">Font Size:</label>
                <input type="number" id="font_size" name="font_size" value="50" min="10" max="200"
                    style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
            </div>
            <div style="margin-bottom: 15px;">
                <label for="opacity" style="display: block; font-weight: bold; margin-bottom: 5px;">Opacity (0-100):</label>
                <input type="range" id="opacity" name="opacity" min="0" max="100" value="20"
                    style="width: 100%;">
                <span id="opacity_value">20%</span>
            </div>
            <button type="submit" style="background-color: #007bff; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer;">
                Add Watermark
            </button>
        </form>
        <div id="add-watermark-status" style="margin-top: 15px; font-weight: bold;"></div>
        <div id="download-watermarked-pdf-container" style="margin-top: 15px; display: none;">
            <a id="download-watermarked-pdf" href="#" download style="background-color: #28a745; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">
                Download Watermarked PDF
            </a>
        </div>
    </div>
    <script>
        // Update opacity value display
        jQuery(document).ready(function($) {
            $('#opacity').on('input', function() {
                $('#opacity_value').text($(this).val() + '%');
            });
        });
    </script>
<?php
    return ob_get_clean();
}
add_shortcode('dw_add_watermark_tool', 'dw_add_watermark_form_shortcode');

/**
 * Shortcode to display the PDF to Text conversion form.
 */
function dw_pdf_to_text_form_shortcode()
{
    ob_start();
?>
    <div id="pdf-to-text-app" style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,.1);">
        <h2>PDF to Text</h2>
        <p>Upload a PDF document to extract its text content.</p>
        <form id="pdf-to-text-form" enctype="multipart/form-data">
            <div style="margin-bottom: 15px;">
                <label for="pdf_file_text" style="display: block; font-weight: bold; margin-bottom: 5px;">Upload PDF File:</label>
                <input type="file" id="pdf_file_text" name="pdf_file" accept=".pdf" required
                    style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
            </div>
            <button type="submit" style="background-color: #007bff; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer;">
                Convert to Text
            </button>
        </form>
        <div id="pdf-to-text-status" style="margin-top: 15px; font-weight: bold;"></div>
        <div id="download-pdf-to-text-container" style="margin-top: 15px; display: none;">
            <a id="download-pdf-to-text" href="#" download style="background-color: #28a745; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">
                Download Text File
            </a>
        </div>
    </div>
<?php
    return ob_get_clean();
}
add_shortcode('dw_pdf_to_text_tool', 'dw_pdf_to_text_form_shortcode');
/**
 * Shortcode to display the PDF rotate form.
 */
function dw_rotate_form_shortcode()
{
    ob_start();
?>
    <div id="pdf-rotate-app" style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,.1);">
        <h2>Rotate PDF</h2>
        <p>Upload a PDF and select a rotation angle.</p>
        <form id="pdf-rotate-form" enctype="multipart/form-data">
            <div style="margin-bottom: 15px;">
                <label for="rotate_pdf_file" style="display: block; font-weight: bold; margin-bottom: 5px;">Upload PDF File:</label>
                <input type="file" id="rotate_pdf_file" name="pdf_file" accept="application/pdf" required
                    style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
            </div>
            <div style="margin-bottom: 15px;">
                <label for="rotation_angle" style="display: block; font-weight: bold; margin-bottom: 5px;">Rotation Angle (Degrees):</label>
                <select id="rotation_angle" name="rotation_angle" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                    <option value="90">90 Degrees (Clockwise)</option>
                    <option value="180">180 Degrees</option>
                    <option value="270">270 Degrees (Clockwise)</option>
                </select>
            </div>
            <button type="submit" style="background-color: #007bff; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer;">
                Rotate PDF
            </button>
        </form>
        <div id="rotate-status" style="margin-top: 15px; font-weight: bold;"></div>
        <div id="download-rotated-pdf-container" style="margin-top: 15px; display: none;">
            <a id="download-rotated-pdf" href="#" download style="background-color: #28a745; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">
                Download Rotated PDF
            </a>
        </div>
    </div>
<?php
    return ob_get_clean();
}
add_shortcode('dw_rotate_tool', 'dw_rotate_form_shortcode');

/**
 * Shortcode to display the PDF delete pages form.
 */
function dw_delete_pages_form_shortcode()
{
    ob_start();
?>
    <div id="pdf-delete-pages-app" style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,.1);">
        <h2>Delete Pages from PDF</h2>
        <p>Upload a PDF and specify which pages to delete (e.g., 1,3,5 or 2-4).</p>
        <form id="pdf-delete-pages-form" enctype="multipart/form-data">
            <div style="margin-bottom: 15px;">
                <label for="delete_pages_pdf_file" style="display: block; font-weight: bold; margin-bottom: 5px;">Upload PDF File:</label>
                <input type="file" id="delete_pages_pdf_file" name="pdf_file" accept="application/pdf" required
                    style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
            </div>
            <div style="margin-bottom: 15px;">
                <label for="pages_to_delete" style="display: block; font-weight: bold; margin-bottom: 5px;">Pages to Delete (e.g., 1,3,5 or 2-4):</label>
                <input type="text" id="pages_to_delete" name="pages_to_delete" required placeholder="e.g., 1, 3, 5-7"
                    style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                <small style="color: #666;">Enter page numbers or ranges, separated by commas.</small>
            </div>
            <button type="submit" style="background-color: #007bff; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer;">
                Delete Pages
            </button>
        </form>
        <div id="delete-pages-status" style="margin-top: 15px; font-weight: bold;"></div>
        <div id="download-modified-pdf-container" style="margin-top: 15px; display: none;">
            <a id="download-modified-pdf" href="#" download style="background-color: #28a745; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">
                Download Modified PDF
            </a>
        </div>
    </div>
<?php
    return ob_get_clean();
}
add_shortcode('dw_delete_pages_tool', 'dw_delete_pages_form_shortcode');

/**
 * Shortcode to display the PDF reorder pages form.
 */
function dw_reorder_pages_form_shortcode()
{
    ob_start();
?>
    <div id="pdf-reorder-pages-app" style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,.1);">
        <h2>Reorder Pages in PDF</h2>
        <p>Upload a PDF and specify the new order of pages (e.g., 3,1,2).</p>
        <form id="pdf-reorder-pages-form" enctype="multipart/form-data">
            <div style="margin-bottom: 15px;">
                <label for="reorder_pdf_file" style="display: block; font-weight: bold; margin-bottom: 5px;">Upload PDF File:</label>
                <input type="file" id="reorder_pdf_file" name="pdf_file" accept="application/pdf" required
                    style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
            </div>
            <div style="margin-bottom: 15px;">
                <label for="new_page_order" style="display: block; font-weight: bold; margin-bottom: 5px;">New Page Order (comma-separated, e.g., 3,1,2,4):</label>
                <input type="text" id="new_page_order" name="new_page_order" required placeholder="e.g., 3,1,2,4"
                    style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                <small style="color: #666;">Enter a comma-separated list of page numbers in the desired new order. All original pages must be included.</small>
            </div>
            <button type="submit" style="background-color: #007bff; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer;">
                Reorder Pages
            </button>
        </form>
        <div id="reorder-pages-status" style="margin-top: 15px; font-weight: bold;"></div>
        <div id="download-reordered-pdf-container" style="margin-top: 15px; display: none;">
            <a id="download-reordered-pdf" href="#" download style="background-color: #28a745; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">
                Download Reordered PDF
            </a>
        </div>
    </div>
<?php
    return ob_get_clean();
}
add_shortcode('dw_reorder_pages_tool', 'dw_reorder_pages_form_shortcode');

// In free-pdf-buddy.php

/**
 * Shortcode to display the Word to PDF conversion form.
 */
function dw_word_to_pdf_form_shortcode()
{
    ob_start();
?>
    <div id="word-to-pdf-app" style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,.1);">
        <h2>Word to PDF</h2>
        <p>Upload a Word document (.docx) to convert it to PDF.</p>
        <form id="word-to-pdf-form" enctype="multipart/form-data">
            <div style="margin-bottom: 15px;">
                <label for="word_file" style="display: block; font-weight: bold; margin-bottom: 5px;">Upload Word File:</label>
                <input type="file" id="word_file" name="office_file" accept=".doc,.docx" required
                    style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
            </div>
            <button type="submit" style="background-color: #007bff; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer;">
                Convert to PDF
            </button>
        </form>
        <div id="word-to-pdf-status" style="margin-top: 15px; font-weight: bold;"></div>
        <div id="download-word-to-pdf-container" style="margin-top: 15px; display: none;">
            <a id="download-word-to-pdf" href="#" download style="background-color: #28a745; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">
                Download PDF
            </a>
        </div>
    </div>
<?php
    return ob_get_clean();
}
add_shortcode('dw_word_to_pdf_tool', 'dw_word_to_pdf_form_shortcode');

/**
 * Shortcode to display the Repair PDF form.
 */
function dw_repair_pdf_form_shortcode()
{
    ob_start();
?>
    <div id="repair-pdf-app" style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,.1);">
        <h2>Repair PDF</h2>
        <p>Upload a potentially corrupted PDF document to attempt repair.</p>
        <form id="repair-pdf-form" enctype="multipart/form-data">
            <div style="margin-bottom: 15px;">
                <label for="pdf_file_repair" style="display: block; font-weight: bold; margin-bottom: 5px;">Upload PDF File:</label>
                <input type="file" id="pdf_file_repair" name="pdf_file" accept=".pdf" required
                    style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
            </div>
            <button type="submit" style="background-color: #007bff; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer;">
                Repair PDF
            </button>
        </form>
        <div id="repair-pdf-status" style="margin-top: 15px; font-weight: bold;"></div>
        <div id="download-repair-pdf-container" style="margin-top: 15px; display: none;">
            <a id="download-repair-pdf" href="#" download style="background-color: #28a745; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">
                Download Repaired PDF
            </a>
        </div>
    </div>
<?php
    return ob_get_clean();
}
add_shortcode('dw_repair_pdf_tool', 'dw_repair_pdf_form_shortcode');


/**
 * Shortcode to display the PDF to Grayscale conversion form.
 */
function dw_pdf_to_grayscale_form_shortcode()
{
    ob_start();
?>
    <div id="pdf-to-grayscale-app" style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,.1);">
        <h2>PDF to Grayscale</h2>
        <p>Upload a PDF document to convert it to grayscale (black and white).</p>
        <form id="pdf-to-grayscale-form" enctype="multipart/form-data">
            <div style="margin-bottom: 15px;">
                <label for="pdf_file_grayscale" style="display: block; font-weight: bold; margin-bottom: 5px;">Upload PDF File:</label>
                <input type="file" id="pdf_file_grayscale" name="pdf_file" accept=".pdf" required
                    style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
            </div>
            <button type="submit" style="background-color: #007bff; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer;">
                Convert to Grayscale
            </button>
        </form>
        <div id="pdf-to-grayscale-status" style="margin-top: 15px; font-weight: bold;"></div>
        <div id="download-pdf-to-grayscale-container" style="margin-top: 15px; display: none;">
            <a id="download-pdf-to-grayscale" href="#" download style="background-color: #28a745; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">
                Download Grayscale PDF
            </a>
        </div>
    </div>
<?php
    return ob_get_clean();
}
add_shortcode('dw_pdf_to_grayscale_tool', 'dw_pdf_to_grayscale_form_shortcode');

// Enqueue the JavaScript for the Unlock PDF feature
function dw_unlock_pdf_enqueue_scripts()
{
    // Only enqueue if we are on the frontend and the shortcode is likely to be used
    // Or if it's an AJAX request (though for localization, frontend is key)
    if (is_admin() && wp_doing_ajax()) {
        // Enqueue on admin-ajax.php requests if needed for some debug, but primarily for frontend
        // No localization needed here for client-side script running on frontend
    } elseif (! is_admin()) {
        wp_enqueue_script(
            'dw-unlock-pdf-script',
            get_template_directory_uri() . '/js/dw-unlock-pdf.js', // Ensure this path is correct
            array('jquery'),
            // filemtime(get_template_directory() . '/js/dw-unlock-pdf.js'), // Use filemtime for cache busting
            true // Load in footer
        );

        // Pass the AJAX URL and nonce to your JavaScript file
        wp_localize_script(
            'dw-unlock-pdf-script',
            'dw_unlock_pdf_ajax',
            array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce'    => wp_create_nonce('dw_unlock_pdf_nonce')
            )
        );
    }
}
add_action('wp_enqueue_scripts', 'dw_unlock_pdf_enqueue_scripts');


/**
 * Shortcode function to display the Unlock PDF form.
 * Add this shortcode [dw_unlock_pdf_tool] to a WordPress page.
 */
function dw_unlock_pdf_form_shortcode()
{
    ob_start(); // Start output buffering
?>
    <div id="unlock-pdf-app" style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,.1);">
        <h2>Unlock/Remove Password from PDF</h2>
        <p>Upload a password-protected PDF and enter the correct password to remove its protection.</p>
        <form id="dw-unlock-pdf-form" enctype="multipart/form-data">
            <div style="margin-bottom: 15px;">
                <label for="unlock_pdf_file" style="display: block; font-weight: bold; margin-bottom: 5px;">Upload Password-Protected PDF:</label>
                <input type="file" id="unlock_pdf_file" name="pdf_file" accept=".pdf" required
                    style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
            </div>
            <div style="margin-bottom: 15px;">
                <label for="pdf_password" style="display: block; font-weight: bold; margin-bottom: 5px;">PDF Password:</label>
                <input type="password" id="pdf_password" name="pdf_password" required
                    style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
            </div>
            <button type="submit" style="background-color: #007bff; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer;">
                Unlock PDF
            </button>
        </form>
        <div id="dw-unlock-pdf-status" style="margin-top: 15px; font-weight: bold;"></div>
        <div id="download-unlock-pdf-container" style="margin-top: 15px; display: none;">
            <a id="download-unlock-pdf" href="#" download style="background-color: #28a745; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">
                Download Unlocked PDF
            </a>
        </div>
    </div>
<?php
    return ob_get_clean(); // Return the buffered content
}
add_shortcode('dw_unlock_pdf_tool', 'dw_unlock_pdf_form_shortcode'); // Register the shortcode

/**
 * Shortcode to display the Crop PDF form.
 */
function dw_crop_pdf_form_shortcode()
{
    ob_start();
?>
    <div id="crop-pdf-app" style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,.1);">
        <h2>Crop PDF</h2>
        <p>Upload a PDF and specify the margins (in points, 1pt = 1/72 inch) to remove from each side.</p>
        <form id="crop-pdf-form" enctype="multipart/form-data">
            <div style="margin-bottom: 15px;">
                <label for="pdf_file_crop" style="display: block; font-weight: bold; margin-bottom: 5px;">Upload PDF File:</label>
                <input type="file" id="pdf_file_crop" name="pdf_file" accept="application/pdf" required
                    style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                <div>
                    <label for="margin_left" style="display: block; font-weight: bold; margin-bottom: 5px;">Left Margin (points):</label>
                    <input type="number" id="margin_left" name="margin_left" value="0" min="0" step="any"
                        style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                </div>
                <div>
                    <label for="margin_top" style="display: block; font-weight: bold; margin-bottom: 5px;">Top Margin (points):</label>
                    <input type="number" id="margin_top" name="margin_top" value="0" min="0" step="any"
                        style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                </div>
                <div>
                    <label for="margin_right" style="display: block; font-weight: bold; margin-bottom: 5px;">Right Margin (points):</label>
                    <input type="number" id="margin_right" name="margin_right" value="0" min="0" step="any"
                        style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                </div>
                <div>
                    <label for="margin_bottom" style="display: block; font-weight: bold; margin-bottom: 5px;">Bottom Margin (points):</label>
                    <input type="number" id="margin_bottom" name="margin_bottom" value="0" min="0" step="any"
                        style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                </div>
            </div>
            <button type="submit" style="background-color: #007bff; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer;">
                Crop PDF
            </button>
        </form>
        <div id="crop-pdf-status" style="margin-top: 15px; font-weight: bold;"></div>
        <div id="download-cropped-pdf-container" style="margin-top: 15px; display: none;">
            <a id="download-cropped-pdf" href="#" download style="background-color: #28a745; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">
                Download Cropped PDF
            </a>
        </div>
    </div>
<?php
    return ob_get_clean();
}
add_shortcode('dw_crop_pdf_tool', 'dw_crop_pdf_form_shortcode');

/**
 * Shortcode to display the Sign PDF form.
 */
function dw_sign_pdf_form_shortcode()
{
    ob_start();
?>
    <div id="sign-pdf-app" style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,.1);">
        <h2>Sign PDF</h2>
        <p>Upload a PDF and your signature image to add a signature.</p>
        <form id="sign-pdf-form" enctype="multipart/form-data">
            <div style="margin-bottom: 15px;">
                <label for="pdf_file_to_sign" style="display: block; font-weight: bold; margin-bottom: 5px;">Upload PDF File:</label>
                <input type="file" id="pdf_file_to_sign" name="pdf_file_to_sign" accept="application/pdf" required
                    style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
            </div>
            <div style="margin-bottom: 15px;">
                <label for="signature_image" style="display: block; font-weight: bold; margin-bottom: 5px;">Upload Signature Image (PNG recommended for transparency):</label>
                <input type="file" id="signature_image" name="signature_image" accept="image/png,image/jpeg" required
                    style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
            </div>
            <div style="margin-bottom: 15px;">
                <label for="sign_page_number" style="display: block; font-weight: bold; margin-bottom: 5px;">Page Number to Sign (e.g., 1 for first page):</label>
                <input type="number" id="sign_page_number" name="sign_page_number" value="1" min="1" required
                    style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
            </div>
            <div style="margin-bottom: 15px;">
                <label for="pos_x" style="display: block; font-weight: bold; margin-bottom: 5px;">Signature X Position (mm from left):</label>
                <input type="number" step="0.1" id="pos_x" name="pos_x" value="150" required
                    style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
            </div>
            <div style="margin-bottom: 15px;">
                <label for="pos_y" style="display: block; font-weight: bold; margin-bottom: 5px;">Signature Y Position (mm from top):</label>
                <input type="number" step="0.1" id="pos_y" name="pos_y" value="250" required
                    style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
            </div>
            <div style="margin-bottom: 15px;">
                <label for="sign_width" style="display: block; font-weight: bold; margin-bottom: 5px;">Signature Width (mm):</label>
                <input type="number" step="0.1" id="sign_width" name="sign_width" value="30" required
                    style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
            </div>
            <button type="submit" style="background-color: #007bff; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer;">
                Add Signature
            </button>
        </form>
        <div id="sign-pdf-status" style="margin-top: 15px; font-weight: bold;"></div>
        <div id="download-signed-pdf-container" style="margin-top: 15px; display: none;">
            <p>PDF signed successfully. Download it here:</p>
            <a id="download-signed-pdf" href="#" download style="background-color: #28a745; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">
                Download Signed PDF
            </a>
        </div>
    </div>
<?php
    return ob_get_clean();
}
add_shortcode('dw_sign_pdf_tool', 'dw_sign_pdf_form_shortcode');
/**
 * Shortcode to display the Organize PDF main form with options for Merge/Split.
 */
function dw_organize_pdf_form_shortcode()
{
    ob_start();
?>
    <div id="organize-pdf-app" style="max-width: 800px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,.1);">
        <h2>Organize PDF</h2>
        <p>Combine multiple PDFs or split a single PDF into smaller documents.</p>

        <div style="margin-bottom: 20px;">
            <button class="organize-tab-button" data-target="merge-pdf-section" style="background-color: #007bff; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">Merge PDFs</button>
            <button class="organize-tab-button" data-target="split-pdf-section" style="background-color: #f0f0f0; color: #333; padding: 10px 15px; border: 1px solid #ccc; border-radius: 4px; cursor: pointer;">Split PDF</button>
        </div>

        <div id="merge-pdf-section" class="organize-section active">
            <h3>Merge PDFs</h3>
            <p>Select multiple PDF files to combine them into a single document.</p>
            <form id="merge-pdf-form" enctype="multipart/form-data">
                <div style="margin-bottom: 15px;">
                    <label for="pdf_files_to_merge" style="display: block; font-weight: bold; margin-bottom: 5px;">Upload PDF Files (Ctrl/Cmd + click to select multiple):</label>
                    <input type="file" id="pdf_files_to_merge" name="pdf_files_to_merge[]" accept="application/pdf" multiple required
                        style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                </div>
                <button type="submit" style="background-color: #007bff; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer;">
                    Merge PDFs
                </button>
            </form>
            <div id="merge-pdf-status" style="margin-top: 15px; font-weight: bold;"></div>
            <div id="download-merged-pdf-container" style="margin-top: 15px; display: none;">
                <p>PDFs merged successfully. Download it here:</p>
                <a id="download-merged-pdf" href="#" download style="background-color: #28a745; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">
                    Download Merged PDF
                </a>
            </div>
        </div>

        <div id="split-pdf-section" class="organize-section ">
        <div id="pdf-split-app" style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,.1);">
            <h2>Split PDF</h2>
            <p>Upload a PDF to split it into individual pages.</p>
            <form id="pdf-split-form" enctype="multipart/form-data">
                <div style="margin-bottom: 15px;">
                    <label for="split_pdf_file" style="display: block; font-weight: bold; margin-bottom: 5px;">Upload PDF File:</label>
                    <input type="file" id="split_pdf_file" name="pdf_file" accept="application/pdf" required
                        style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                </div>
                <button type="submit" style="background-color: #007bff; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer;">
                    Split PDF
                </button>
            </form>
            <div id="split-status" style="margin-top: 15px; font-weight: bold;"></div>
            <div id="download-split-pdfs-container" style="margin-top: 15px; display: none;">
            </div>
        </div>
        </div>
    </div>
<?php
    return ob_get_clean();
}
add_shortcode('dw_organize_pdf_tool', 'dw_organize_pdf_form_shortcode');

// --- AJAX Handler for MERGE PDFs ---
add_action('wp_ajax_dw_merge_pdf', 'dw_merge_pdf_callback');
add_action('wp_ajax_nopriv_dw_merge_pdf', 'dw_merge_pdf_callback');

function dw_merge_pdf_callback()
{
    // IMPORTANT: Uncomment this for production:
    // check_ajax_referer('dw_organize_pdf_nonce', 'nonce');

    $uploaded_files = $_FILES['pdf_files_to_merge'] ?? [];

    if (empty($uploaded_files) || !isset($uploaded_files['name']) || !is_array($uploaded_files['name'])) {
        wp_send_json_error(['message' => 'Please upload at least two PDF files to merge.']);
        exit;
    }

    $valid_files = [];
    foreach ($uploaded_files['error'] as $key => $error) {
        if ($error === UPLOAD_ERR_OK && $uploaded_files['type'][$key] === 'application/pdf') {
            $valid_files[] = [
                'tmp_name' => $uploaded_files['tmp_name'][$key],
                'name' => $uploaded_files['name'][$key],
            ];
        } else {
            wp_send_json_error(['message' => 'One or more uploaded files are not valid PDFs or had upload errors.']);
            exit;
        }
    }

    if (count($valid_files) < 2) {
        wp_send_json_error(['message' => 'Please upload at least two PDF files to merge.']);
        exit;
    }

    $upload_dir = wp_upload_dir();
    $temp_dir_path = $upload_dir['basedir'] . '/docwiz_merge_temp_' . uniqid() . '/';
    $output_merged_pdf_filepath = ''; // Initialize to empty string

    try {
        if (!wp_mkdir_p($temp_dir_path)) {
            throw new Exception('Failed to create temporary directory for merging.');
        }

        $temp_uploaded_pdf_paths = [];
        // Move all uploaded PDFs to temp directory
        foreach ($valid_files as $file) {
            $temp_file_name = 'merge_input_' . uniqid() . '.pdf';
            $temp_file_path = $temp_dir_path . $temp_file_name;
            if (!move_uploaded_file($file['tmp_name'], $temp_file_path)) {
                throw new Exception('Failed to move uploaded PDF file: ' . $file['name']);
            }
            if (!file_exists($temp_file_path) || !is_readable($temp_file_path)) {
                throw new Exception('Cannot read the moved PDF file: ' . $temp_file_path);
            }
            $temp_uploaded_pdf_paths[] = $temp_file_path;
        }

        // Initialize FPDI here, after files are confirmed moved and readable
        $pdf = new Fpdi();
        $pdf->SetAutoPageBreak(false);

        foreach ($temp_uploaded_pdf_paths as $input_pdf_path) {
            // Check again for safety, though it should be caught above
            if (!file_exists($input_pdf_path) || !is_readable($input_pdf_path)) {
                throw new Exception('Cannot read input PDF file: ' . basename($input_pdf_path));
            }

            $pageCount = $pdf->setSourceFile($input_pdf_path);
            for ($i = 1; $i <= $pageCount; $i++) {
                $templateId = $pdf->importPage($i);
                $pageSize = $pdf->getTemplateSize($templateId);
                // Add page using the imported page's orientation and dimensions
                $pdf->AddPage($pageSize['orientation'], [$pageSize['width'], $pageSize['height']]);
                $pdf->useTemplate($templateId);
            }
        }

        $output_merged_pdf_filename = 'merged_pdf_' . time() . '.pdf';
        $output_merged_pdf_filepath = $upload_dir['basedir'] . '/' . $output_merged_pdf_filename;
        $download_url = $upload_dir['baseurl'] . '/' . $output_merged_pdf_filename;

        $pdf->Output($output_merged_pdf_filepath, 'F');

        if (!file_exists($output_merged_pdf_filepath) || filesize($output_merged_pdf_filepath) === 0) {
            throw new Exception('Failed to create merged PDF file or it is empty.');
        }

        wp_send_json_success([
            'message' => 'PDFs merged successfully!',
            'download_url' => $download_url
        ]);
    } catch (Exception $e) {
        error_log('Merge PDF Error: ' . $e->getMessage() . ' Trace: ' . $e->getTraceAsString());
        wp_send_json_error(['message' => 'PDF merging failed: ' . $e->getMessage()]);
    } finally {
        // Clean up temporary files and directory
        if (is_dir($temp_dir_path)) {
            rrmdir($temp_dir_path);
        }
    }
    exit;
}

// --- AJAX Handler for SPLIT PDF (with fix for "No reader initiated") ---
add_action('wp_ajax_dw_split_pdf', 'dw_split_pdf_callback');
add_action('wp_ajax_nopriv_dw_split_pdf', 'dw_split_pdf_callback');

function dw_split_pdf_callback()
{
    // IMPORTANT: Uncomment this for production:
    // check_ajax_referer('dw_organize_pdf_nonce', 'nonce');

    $uploaded_file = $_FILES['pdf_file_to_split'] ?? null;
    $split_method = sanitize_text_field($_POST['split_method'] ?? 'every_page');
    $page_ranges_str = sanitize_text_field($_POST['page_ranges'] ?? '');

    if (empty($uploaded_file['name']) || $uploaded_file['type'] !== 'application/pdf') {
        wp_send_json_error(['message' => 'Please upload a valid PDF file to split.']);
        exit;
    }

    $upload_dir = wp_upload_dir();
    $temp_dir_path = $upload_dir['basedir'] . '/docwiz_split_temp_' . uniqid() . '/';
    $temp_input_pdf_path = ''; // Initialize to empty string

    try {
        if (!wp_mkdir_p($temp_dir_path)) {
            throw new Exception('Failed to create temporary directory for splitting.');
        }

        // Move uploaded PDF to temp directory
        $temp_input_pdf_name = 'input_split_' . uniqid() . '.pdf';
        $temp_input_pdf_path = $temp_dir_path . $temp_input_pdf_name;
        if (!move_uploaded_file($uploaded_file['tmp_name'], $temp_input_pdf_path)) {
            throw new Exception('Failed to move uploaded PDF file to temp location. Check permissions for: ' . $temp_dir_path);
        }

        if (!file_exists($temp_input_pdf_path) || !is_readable($temp_input_pdf_path)) {
            throw new Exception('Cannot read the uploaded PDF file for splitting after move: ' . $temp_input_pdf_path);
        }

        // --- FIX Applied Here: Initialize Fpdi INSIDE try block ---
        $pdf = new Fpdi(); // <--- This line moved here
        $pdf->SetAutoPageBreak(false);

        $pageCount = $pdf->setSourceFile($temp_input_pdf_path);

        $split_parts_info = [];
        if ($split_method === 'every_page') {
            for ($i = 1; $i <= $pageCount; $i++) {
                $split_parts_info[] = [$i];
            }
        } elseif ($split_method === 'range') {
            $ranges = array_filter(array_map('trim', explode(',', $page_ranges_str)));
            if (empty($ranges)) {
                throw new Exception('Please specify valid page ranges (e.g., 1-5, 8, 10-12).');
            }

            foreach ($ranges as $range) {
                if (strpos($range, '-') !== false) {
                    list($start, $end) = array_map('intval', explode('-', $range));
                    if ($start < 1 || $end > $pageCount || $start > $end || $start > $end) { // Added start > end validation
                        throw new Exception("Invalid page range specified: {$range}. Pages must be within 1 and {$pageCount}.");
                    }
                    $split_parts_info[] = range($start, $end);
                } else {
                    $page_num = intval($range);
                    if ($page_num < 1 || $page_num > $pageCount) {
                        throw new Exception("Invalid page number specified: {$page_num}. Page must be within 1 and {$pageCount}.");
                    }
                    $split_parts_info[] = [$page_num];
                }
            }
        } else {
            throw new Exception('Invalid split method selected.');
        }

        $split_count = 0;
        foreach ($split_parts_info as $pages_for_part) {
            if (empty($pages_for_part)) continue;

            $split_pdf = new Fpdi(); // Each split part gets a new FPDI instance
            $split_pdf->SetAutoPageBreak(false);

            foreach ($pages_for_part as $page_num) {
                $templateId = $split_pdf->importPage($page_num);
                $pageSize = $split_pdf->getTemplateSize($templateId);
                $split_pdf->AddPage($pageSize['orientation'], [$pageSize['width'], $pageSize['height']]);
                $split_pdf->useTemplate($templateId);
            }

            $part_filename = 'split_part_' . (++$split_count) . '_' . time() . '.pdf';
            $part_filepath = $temp_dir_path . $part_filename;
            $split_pdf->Output($part_filepath, 'F');
            if (!file_exists($part_filepath) || filesize($part_filepath) === 0) {
                throw new Exception('Failed to create split PDF part: ' . $part_filename);
            }
            $output_split_pdf_paths[] = $part_filepath;
        }

        if (empty($output_split_pdf_paths)) {
            throw new Exception('No PDF parts were generated based on the split criteria.');
        }

        // --- Create a ZIP archive of the split PDFs ---
        if (!class_exists('ZipArchive')) {
            throw new Exception('PHP ZipArchive extension is not enabled. Cannot create ZIP file.');
        }
        $zip = new ZipArchive();
        $zip_filename = 'split_pdfs_' . time() . '.zip';
        // Save the ZIP directly in the uploads base directory, not the temp dir
        $output_zip_filepath = $upload_dir['basedir'] . '/' . $zip_filename;
        $download_url = $upload_dir['baseurl'] . '/' . $zip_filename;

        if ($zip->open($output_zip_filepath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== TRUE) {
            throw new Exception('Cannot create ZIP archive at ' . $output_zip_filepath);
        }

        foreach ($output_split_pdf_paths as $split_file) {
            if (file_exists($split_file) && is_readable($split_file)) {
                $zip->addFile($split_file, basename($split_file));
            } else {
                error_log('Warning: Split file not found or not readable when adding to ZIP: ' . $split_file);
            }
        }
        $zip->close();

        if (!file_exists($output_zip_filepath) || filesize($output_zip_filepath) === 0) {
            throw new Exception('Failed to create ZIP archive or it is empty after creation. Output path: ' . $output_zip_filepath);
        }

        wp_send_json_success([
            'message' => 'PDF split successfully!',
            'download_url' => $download_url
        ]);
    } catch (Exception $e) {
        error_log('Split PDF Error: ' . $e->getMessage() . ' Trace: ' . $e->getTraceAsString());
        wp_send_json_error(['message' => 'PDF splitting failed: ' . $e->getMessage()]);
    } finally {
        // Clean up temporary files and directory (including all split parts)
        if (is_dir($temp_dir_path)) {
            rrmdir($temp_dir_path);
        }
        // Also ensure the final generated zip file (if any) is not deleted here
        // as it's meant for download and outside the temp_dir_path.
    }
    exit;
}

// Helper function to recursively delete a directory (make sure this is accessible)
if (!function_exists('rrmdir')) {
    function rrmdir($dir)
    {
        if (is_dir($dir)) {
            $objects = scandir($dir);
            foreach ($objects as $object) {
                if ($object != "." && $object != "..") {
                    if (is_dir($dir . "/" . $object))
                        rrmdir($dir . "/" . $object);
                    else
                        unlink($dir . "/" . $object);
                }
            }
            rmdir($dir);
        }
    }
}
/**
 * AJAX handler for adding an image-based signature to a PDF.
 */
add_action('wp_ajax_dw_sign_pdf', 'dw_sign_pdf_callback');
add_action('wp_ajax_nopriv_dw_sign_pdf', 'dw_sign_pdf_callback'); // Allow non-logged-in users

function dw_sign_pdf_callback()
{
    // IMPORTANT: Implement nonce check for security!
    // check_ajax_referer('dw_sign_pdf_nonce', 'nonce');

    $uploaded_pdf_file = $_FILES['pdf_file_to_sign'] ?? null;
    $uploaded_signature_image = $_FILES['signature_image'] ?? null;

    $page_number = intval(sanitize_text_field($_POST['sign_page_number']));
    $pos_x = floatval(sanitize_text_field($_POST['pos_x']));
    $pos_y = floatval(sanitize_text_field($_POST['pos_y']));
    $sign_width = floatval(sanitize_text_field($_POST['sign_width']));

    // Basic validation
    if (empty($uploaded_pdf_file['name']) || empty($uploaded_signature_image['name'])) {
        wp_send_json_error(array('message' => 'Both PDF and signature image files are required.'));
        exit;
    }
    if ($uploaded_pdf_file['type'] !== 'application/pdf') {
        wp_send_json_error(array('message' => 'Uploaded file must be a PDF.'));
        exit;
    }
    if (!in_array($uploaded_signature_image['type'], ['image/png', 'image/jpeg'])) {
        wp_send_json_error(array('message' => 'Signature image must be a PNG or JPEG.'));
        exit;
    }
    if ($page_number < 1 || $pos_x < 0 || $pos_y < 0 || $sign_width <= 0) {
        wp_send_json_error(array('message' => 'Invalid page number or signature position/width.'));
        exit;
    }


    $upload_dir = wp_upload_dir();
    $temp_dir_path = $upload_dir['basedir'] . '/docwiz_sign_temp_' . uniqid() . '/'; // Unique temp directory for this operation

    $temp_pdf_input_path = '';
    $temp_signature_image_path = '';
    $output_signed_pdf_filepath = '';

    try {
        // Create unique temporary directory
        if (!wp_mkdir_p($temp_dir_path)) {
            throw new Exception('Failed to create temporary directory.');
        }

        // Move uploaded PDF to temp location
        $temp_pdf_input_name = 'unsigned_' . uniqid() . '.pdf';
        $temp_pdf_input_path = $temp_dir_path . $temp_pdf_input_name;
        if (!move_uploaded_file($uploaded_pdf_file['tmp_name'], $temp_pdf_input_path)) {
            throw new Exception('Failed to move uploaded PDF file.');
        }

        // Move uploaded signature image to temp location
        $signature_ext = pathinfo($uploaded_signature_image['name'], PATHINFO_EXTENSION);
        $temp_signature_image_name = 'signature_' . uniqid() . '.' . $signature_ext;
        $temp_signature_image_path = $temp_dir_path . $temp_signature_image_name;
        if (!move_uploaded_file($uploaded_signature_image['tmp_name'], $temp_signature_image_path)) {
            throw new Exception('Failed to move uploaded signature image.');
        }

        if (!file_exists($temp_pdf_input_path) || !is_readable($temp_pdf_input_path)) {
            throw new Exception('Cannot read the uploaded PDF file.');
        }
        if (!file_exists($temp_signature_image_path) || !is_readable($temp_signature_image_path)) {
            throw new Exception('Cannot read the uploaded signature image.');
        }

        // --- Core PDF Signing Logic using FPDI/FPDF ---
        $pdf = new Fpdi();
        $pageCount = $pdf->setSourceFile($temp_pdf_input_path);

        if ($page_number > $pageCount) {
            throw new Exception("Page number $page_number does not exist in the PDF (Total pages: $pageCount).");
        }

        for ($i = 1; $i <= $pageCount; $i++) {
            $templateId = $pdf->importPage($i);
            // Get page dimensions to handle different page sizes
            $pageSize = $pdf->getTemplateSize($templateId);
            $pdf->AddPage($pageSize['orientation'], [$pageSize['width'], $pageSize['height']]);
            $pdf->useTemplate($templateId);

            // Add signature only to the specified page
            if ($i == $page_number) {
                // FPDI AddImage uses MM (millimeters) as units by default
                // X, Y coordinates are from top-left corner of the page
                // Width (w) is specified, Height (h) is calculated automatically to maintain aspect ratio if 0
                // Link is optional
                $pdf->Image($temp_signature_image_path, $pos_x, $pos_y, $sign_width, 0);
            }
        }

        $output_signed_pdf_filename = 'signed_pdf_' . time() . '.pdf';
        $output_signed_pdf_filepath = $upload_dir['basedir'] . '/' . $output_signed_pdf_filename;
        $download_url = $upload_dir['baseurl'] . '/' . $output_signed_pdf_filename;

        // Save the output PDF
        $pdf->Output($output_signed_pdf_filepath, 'F'); // 'F' saves to a local file

        if (!file_exists($output_signed_pdf_filepath) || filesize($output_signed_pdf_filepath) === 0) {
            throw new Exception('Failed to create signed PDF file or it is empty.');
        }

        wp_send_json_success(array(
            'message' => 'PDF signed successfully!',
            'download_url' => $download_url
        ));
    } catch (Exception $e) {
        error_log('PDF Signing Error: ' . $e->getMessage() . ' Trace: ' . $e->getTraceAsString());
        wp_send_json_error(array('message' => 'PDF signing failed: ' . $e->getMessage()));
    } finally {
        // --- Cleanup Temporary Files and Directory ---
        // Recursively delete the temporary directory
        if (is_dir($temp_dir_path)) {
            $it = new RecursiveDirectoryIterator($temp_dir_path, RecursiveDirectoryIterator::SKIP_DOTS);
            $files = new RecursiveIteratorIterator($it, RecursiveIteratorIterator::CHILD_FIRST);
            foreach ($files as $file) {
                if ($file->isDir()) {
                    rmdir($file->getRealPath());
                } else {
                    unlink($file->getRealPath());
                }
            }
            rmdir($temp_dir_path);
        }
        // Ensure original uploaded files are also deleted if they weren't in the temp dir
        if (file_exists($temp_pdf_input_path) && strpos($temp_pdf_input_path, $temp_dir_path) === false) unlink($temp_pdf_input_path);
        if (file_exists($temp_signature_image_path) && strpos($temp_signature_image_path, $temp_dir_path) === false) unlink($temp_signature_image_path);
    }
    exit;
}
//----------------------------------------------------------------------
// AJAX Handlers for PDF Operations
//----------------------------------------------------------------------


/**
 * AJAX handler for cropping PDF using Ghostscript.
 */
add_action('wp_ajax_dw_crop_pdf', 'dw_crop_pdf_callback');
add_action('wp_ajax_nopriv_dw_crop_pdf', 'dw_crop_pdf_callback'); // Allow non-logged-in users

function dw_crop_pdf_callback()
{
    // 1. Security check (UNCOMMENT THIS IN PRODUCTION!)
    // check_ajax_referer('dw_crop_pdf_nonce', 'nonce');

    // 2. Validate file upload
    if (empty($_FILES['pdf_file']['name'])) {
        wp_send_json_error(array('message' => 'No PDF file selected.'));
        exit;
    }

    $uploaded_file = $_FILES['pdf_file'];
    // Sanitize and convert input margins to float
    $margin_left = floatval(sanitize_text_field($_POST['margin_left']));
    $margin_top = floatval(sanitize_text_field($_POST['margin_top']));
    $margin_right = floatval(sanitize_text_field($_POST['margin_right']));
    $margin_bottom = floatval(sanitize_text_field($_POST['margin_bottom']));

    $upload_dir = wp_upload_dir();
    $upload_path = $upload_dir['basedir'] . '/';

    $temp_input_pdf_path = ''; // For cleanup
    $output_pdf_filepath = ''; // For cleanup

    try {
        // Handle the uploaded PDF file
        if ($uploaded_file['error'] !== UPLOAD_ERR_OK || $uploaded_file['type'] !== 'application/pdf') {
            throw new Exception('File upload error or not a PDF.');
        }

        $temp_input_pdf_name = uniqid('uploaded_crop_') . '.pdf';
        $temp_input_pdf_path = $upload_path . $temp_input_pdf_name;

        // Move uploaded file to a temporary location
        if (!move_uploaded_file($uploaded_file['tmp_name'], $temp_input_pdf_path)) {
            throw new Exception('Failed to move uploaded PDF file to temporary location.');
        }

        // *** CRITICAL CORRECTION: Convert paths for Windows if necessary ***
        // WordPress's wp_upload_dir() returns paths with forward slashes.
        // On Windows, these paths often need to be converted to backslashes for native tools/libraries.
        $is_windows = (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN');

        if ($is_windows) {
            $temp_input_pdf_path_for_tools = str_replace('/', '\\', $temp_input_pdf_path);
        } else {
            $temp_input_pdf_path_for_tools = $temp_input_pdf_path;
        }

        // Verify the temporary file is accessible *after* path conversion
        if (!file_exists($temp_input_pdf_path_for_tools) || !is_readable($temp_input_pdf_path_for_tools)) {
            throw new Exception('Cannot read the uploaded PDF file for cropping (path issue or permissions).');
        }

        // --- Get Original PDF Dimensions using FPDI ---
        // FPDI needs a correctly formatted path.
        $original_width = 0;
        $original_height = 0;

        try {
            $pdf_temp_reader = new Fpdi();
            // Pass the Windows-formatted path to FPDI if on Windows
            $pageCount_temp = $pdf_temp_reader->setSourceFile($temp_input_pdf_path_for_tools);
            if ($pageCount_temp > 0) {
                // Assuming all pages have the same dimensions for consistent cropping
                $template_size = $pdf_temp_reader->getTemplateSize($pdf_temp_reader->importPage(1));
                $original_width = $template_size['width'];
                $original_height = $template_size['height'];
            } else {
                throw new Exception('Could not determine PDF page size (PDF might be empty or corrupt).');
            }
        } catch (Exception $e) {
            error_log('Error getting PDF dimensions with FPDI: ' . $e->getMessage());
            throw new Exception('Failed to get original PDF dimensions needed for cropping. FPDI Error: ' . $e->getMessage());
        }

        // --- Start Cropping Logic with Ghostscript ---
        $output_pdf_filename = 'cropped_pdf_' . time() . '.pdf';
        $output_pdf_filepath = $upload_path . $output_pdf_filename;
        $download_url = $upload_dir['baseurl'] . '/' . $output_pdf_filename;

        // Define Ghostscript executable path specifically.
        // For Windows, ensure it's correctly quoted and backslashes are escaped in the PHP string.
        if ($is_windows) {
            // Your exact path for Windows
            $ghostscript_executable_path = '"DW_GHOSTSCRIPT_PATH"';
            $output_pdf_filepath_for_tools = str_replace('/', '\\', $output_pdf_filepath);
        } else {
            // Typical path for Linux/macOS
            $ghostscript_executable_path = '/usr/bin/gs';
            $output_pdf_filepath_for_tools = $output_pdf_filepath;
        }


        // Calculate new CropBox coordinates and dimensions
        $new_cropbox_left = $margin_left;
        $new_cropbox_bottom = $margin_bottom;

        // Calculate new width and height for the CropBox. Ensure positive dimensions.
        // The max(1, ...) ensures dimensions are at least 1 point, preventing 'rangecheck'.
        $cropped_width = max(1, $original_width - $margin_left - $margin_right);
        $cropped_height = max(1, $original_height - $margin_top - $margin_bottom);

        // The right and top coordinates are calculated from the left/bottom plus the new width/height
        $new_cropbox_right = $new_cropbox_left + $cropped_width;
        $new_cropbox_top = $new_cropbox_bottom + $cropped_height;

        // Construct PostScript snippet to set the CropBox.
        // This dynamically inserts the calculated values from PHP.
        $postscript_crop_snippet = sprintf(
            '<</CropBox [%F %F %F %F]>> setpagedevice',
            $new_cropbox_left,
            $new_cropbox_bottom,
            $new_cropbox_right,
            $new_cropbox_top
        );

        // Ghostscript command
        // escapeshellarg() is crucial for sanitizing paths passed to the shell,
        // especially on Windows with spaces in paths.
        $command = sprintf(
            '%s -o %s -sDEVICE=pdfwrite -dQUIET -dNOPAUSE -dBATCH -dCompatibilityLevel=1.4 -dPDFSETTINGS=/prepress -c "%s" -f %s 2>&1',
            escapeshellarg($ghostscript_executable_path),
            escapeshellarg($output_pdf_filepath_for_tools), // Use the OS-specific path
            $postscript_crop_snippet, // PostScript doesn't need escapeshellarg
            escapeshellarg($temp_input_pdf_path_for_tools) // Use the OS-specific path
        );

        $output = [];
        $return_var = null;
        exec($command, $output, $return_var);

        if ($return_var !== 0) {
            error_log('Ghostscript PDF cropping error. Command: ' . $command . ' Return Code: ' . $return_var . ' Output: ' . implode("\n", $output));
            throw new Exception('PDF cropping failed. Ghostscript Error Code: ' . $return_var . '. Output: ' . implode("\n", $output));
        }

        // Check if the output PDF file was actually created and is not empty
        if (!file_exists($output_pdf_filepath) || filesize($output_pdf_filepath) === 0) {
            throw new Exception('Cropped PDF file not found or is empty. Check Ghostscript installation/permissions/output.');
        }
        // --- End Cropping Logic ---

        // Clean up original uploaded file
        if (file_exists($temp_input_pdf_path)) {
            unlink($temp_input_pdf_path);
        }

        wp_send_json_success(array(
            'message' => 'PDF cropped successfully!',
            'download_url' => $download_url
        ));
    } catch (Exception $e) {
        // Clean up files on error
        if (file_exists($temp_input_pdf_path)) {
            unlink($temp_input_pdf_path);
        }
        if (file_exists($output_pdf_filepath)) {
            unlink($output_pdf_filepath);
        }
        wp_send_json_error(array('message' => 'Cropping failed: ' . $e->getMessage()));
    }
    exit; // Always exit after wp_send_json_success/error
}

/**
 * AJAX handler for unlocking password-protected PDF files using Ghostscript.
 */
add_action('wp_ajax_dw_unlock_pdf', 'dw_unlock_pdf_callback');
add_action('wp_ajax_nopriv_dw_unlock_pdf', 'dw_unlock_pdf_callback'); // Allows logged-out users to use it

function dw_unlock_pdf_callback()
{
    // Verify nonce for security
    if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'dw_unlock_pdf_nonce')) {
        wp_send_json_error(array('message' => 'Security check failed. Please refresh the page.'));
    }

    if (empty($_FILES['pdf_file']['name'])) {
        wp_send_json_error(array('message' => 'No PDF file selected.'));
    }
    if (empty($_POST['pdf_password'])) {
        wp_send_json_error(array('message' => 'Please provide the password for the PDF.'));
    }

    $uploaded_file = $_FILES['pdf_file'];
    $pdf_password = sanitize_text_field($_POST['pdf_password']);

    $upload_dir = wp_upload_dir();
    $base_upload_path = rtrim(str_replace('\\', '/', $upload_dir['basedir']), '/');
    $base_upload_url = rtrim(str_replace('\\', '/', $upload_dir['baseurl']), '/');

    $temp_input_dir = $base_upload_path . '/temp_unlock_inputs/';
    $temp_output_dir = $base_upload_path . '/unlocked_pdfs/';

    $temp_input_pdf_path = '';
    $unlocked_pdf_path = ''; // Initialize to ensure it's always defined

    try {
        // Ensure directories exist
        if (!is_dir($temp_input_dir)) {
            mkdir($temp_input_dir, 0755, true);
        }
        if (!is_dir($temp_output_dir)) {
            mkdir($temp_output_dir, 0755, true);
        }

        // 1. Handle File Upload
        if ($uploaded_file['error'] === UPLOAD_ERR_OK) {
            $file_ext = pathinfo($uploaded_file['name'], PATHINFO_EXTENSION);
            if (strtolower($file_ext) !== 'pdf') {
                throw new Exception('Invalid file type. Only PDF files are supported.');
            }

            $temp_input_pdf_name = uniqid('uploaded_unlock_') . '.pdf';
            $temp_input_pdf_path = $temp_input_dir . $temp_input_pdf_name;

            if (!move_uploaded_file($uploaded_file['tmp_name'], $temp_input_pdf_path)) {
                throw new Exception('Failed to move uploaded file.');
            }
        } else {
            throw new Exception('File upload error: ' . $uploaded_file['error']);
        }

        if (!file_exists($temp_input_pdf_path) || !is_readable($temp_input_pdf_path)) {
            throw new Exception('Cannot read the uploaded PDF file for processing.');
        }

        // ** Dynamically get Ghostscript executable path from wp-config.php **
        if (!defined('DW_GHOSTSCRIPT_PATH')) {
            // Fallback if constant is not defined (shouldn't happen with proper wp-config.php updates)
            $gs_executable_temp = 'gs'; // Assume 'gs' is in PATH as a last resort
            error_log('DW_GHOSTSCRIPT_PATH not defined in Unlock PDF callback. Using default "gs" fallback.');
        } else {
            $gs_executable_temp = DW_GHOSTSCRIPT_PATH;
        }

        // Escape the executable path for safe shell execution
        $gs_executable_path_for_command = escapeshellarg($gs_executable_temp);


        // 2. Prepare Ghostscript Command for Unlocking
        $unlocked_file_name = 'unlocked_pdf_' . time() . '.pdf';
        $unlocked_pdf_path = $temp_output_dir . $unlocked_file_name;

        // Construct the Ghostscript command
        $gs_command = $gs_executable_path_for_command . // Use the dynamically retrieved and escaped path
            ' -q -dNOPAUSE -dBATCH -sDEVICE=pdfwrite' .
            ' -sOwnerPassword=' . escapeshellarg($pdf_password) . // Try owner password
            ' -sUserPassword=' . escapeshellarg($pdf_password) . // Try user password
            ' -o ' . escapeshellarg($unlocked_pdf_path) .
            ' ' . escapeshellarg($temp_input_pdf_path) .
            ' 2>&1'; // Redirect stderr to stdout for capturing errors

        error_log('Ghostscript Unlock Command: ' . $gs_command); // Log the command for debugging

        $output = [];
        $return_var = 0;
        exec($gs_command, $output, $return_var); // Execute the command

        error_log('Ghostscript Unlock Output: ' . implode("\n", $output)); // Log Ghostscript's output
        error_log('Ghostscript Unlock Return Var: ' . $return_var); // Log Ghostscript's return code

        // Check if Ghostscript command was successful and the output file exists and is not empty
        if ($return_var !== 0 || !file_exists($unlocked_pdf_path) || filesize($unlocked_pdf_path) == 0) {
            $error_output = implode("\n", $output);
            if (strpos($error_output, 'Password incorrect') !== false || strpos($error_output, 'Incorrect password') !== false) {
                throw new Exception('Incorrect password provided for the PDF. Please try again.');
            }
            throw new Exception('Ghostscript failed to unlock the PDF. Output: ' . $error_output . '. Return Code: ' . $return_var);
        }

        // 3. Generate downloadable URL
        $unlocked_pdf_url = $base_upload_url . '/unlocked_pdfs/' . $unlocked_file_name;

        wp_send_json_success(array(
            'message' => 'PDF unlocked successfully!',
            'download_url' => $unlocked_pdf_url
        ));
    } catch (Exception $e) {
        error_log('PDF Unlock Exception: ' . $e->getMessage()); // Log detailed exception message
        wp_send_json_error(array('message' => 'PDF unlocking failed: ' . $e->getMessage()));
    } finally {
        // Clean up temporary input file
        if (file_exists($temp_input_pdf_path)) {
            unlink($temp_input_pdf_path);
        }
        // Clean up the output file if an error occurred after its creation
        if (file_exists($unlocked_pdf_path) && (isset($e) || filesize($unlocked_pdf_path) == 0)) { // Add filesize check for robust cleanup
            unlink($unlocked_pdf_path);
        }
        // Consider a separate cron job for cleaning up old files in /unlocked_pdfs/
    }
}
/**
 * AJAX handler for PDF to Grayscale conversion.
 */
add_action('wp_ajax_dw_pdf_to_grayscale', 'dw_pdf_to_grayscale_callback');
add_action('wp_ajax_nopriv_dw_pdf_to_grayscale', 'dw_pdf_to_grayscale_callback');

function dw_pdf_to_grayscale_callback()
{
    check_ajax_referer('dw_pdf_to_grayscale_nonce', 'nonce');

    if (empty($_FILES['pdf_file']['name'])) {
        wp_send_json_error(array('message' => 'No PDF file selected.'));
    }

    $uploaded_file = $_FILES['pdf_file'];
    $upload_dir = wp_upload_dir();
    $base_upload_path = rtrim(str_replace('\\', '/', $upload_dir['basedir']), '/');

    $gs_executable_path = '"DW_GHOSTSCRIPT_PATH"';

    $temp_input_pdf_path = '';
    $temp_normalized_pdf_path = '';
    $temp_grayscale_image_path = ''; // New: Path for the intermediate grayscale image
    $temp_output_dir = $base_upload_path . '/temp_conversions/';
    $output_grayscale_pdf_path = '';

    try {
        if (!is_dir($temp_output_dir)) {
            mkdir($temp_output_dir, 0755, true);
        }

        if ($uploaded_file['error'] === UPLOAD_ERR_OK) {
            $file_ext = pathinfo($uploaded_file['name'], PATHINFO_EXTENSION);
            if (strtolower($file_ext) !== 'pdf') {
                throw new Exception('Invalid file type. Only PDF files are supported.');
            }
            $temp_input_pdf_name = uniqid('uploaded_pdf_') . '.pdf';
            $temp_input_pdf_path = $temp_output_dir . $temp_input_pdf_name;
            if (!move_uploaded_file($uploaded_file['tmp_name'], $temp_input_pdf_path)) {
                throw new Exception('Failed to move uploaded file.');
            }
        } else {
            throw new Exception('File upload error.');
        }

        if (!file_exists($temp_input_pdf_path) || !is_readable($temp_input_pdf_path)) {
            throw new Exception('Cannot read the uploaded PDF file.');
        }

        // --- Step 1: Normalize/Clean the PDF ---
        $temp_normalized_pdf_name = uniqid('normalized_pdf_') . '.pdf';
        $temp_normalized_pdf_path = $temp_output_dir . $temp_normalized_pdf_name;
        $normalize_command = $gs_executable_path . ' -dNOPAUSE -dBATCH -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/printer -sOutputFile=' . escapeshellarg($temp_normalized_pdf_path) . ' ' . escapeshellarg($temp_input_pdf_path) . ' 2>&1';
        $output_normalize = null;
        $return_var_normalize = null;
        exec($normalize_command, $output_normalize, $return_var_normalize);
        error_log('PDF Normalize Ghostscript Command: ' . $normalize_command);
        error_log('PDF Normalize Ghostscript Return Var: ' . $return_var_normalize);
        error_log('PDF Normalize Ghostscript Output: ' . implode("\n", $output_normalize));
        if ($return_var_normalize !== 0 || !file_exists($temp_normalized_pdf_path) || filesize($temp_normalized_pdf_path) === 0) {
            throw new Exception('PDF normalization failed (Step 1). Ghostscript return code: ' . $return_var_normalize . '. Output: ' . implode("\n", $output_normalize));
        }
        if (file_exists($temp_input_pdf_path)) {
            unlink($temp_input_pdf_path);
        }

        // --- Step 2: Convert Normalized PDF to Grayscale Image ---
        $temp_grayscale_image_name = uniqid('grayscale_img_') . '_%d.jpg'; // %d for page number
        $temp_grayscale_image_path = $temp_output_dir . $temp_grayscale_image_name;

        // Use a grayscale image device like `jpeg` with `-sColorConversionStrategy=Gray`
        // -r300: 300 DPI for decent quality
        $gs_command_to_image = $gs_executable_path . ' -dNOPAUSE -dBATCH -sDEVICE=jpeg -r300 -sColorConversionStrategy=/Gray -sProcessColorModel=/DeviceGray -sOutputFile=' . escapeshellarg($temp_grayscale_image_path) . ' ' . escapeshellarg($temp_normalized_pdf_path) . ' 2>&1';

        $output_to_image = null;
        $return_var_to_image = null;
        exec($gs_command_to_image, $output_to_image, $return_var_to_image);

        error_log('PDF to Grayscale Image (Step 2) Ghostscript Command: ' . $gs_command_to_image);
        error_log('PDF to Grayscale Image (Step 2) Ghostscript Return Var: ' . $return_var_to_image);
        error_log('PDF to Grayscale Image (Step 2) Ghostscript Output: ' . implode("\n", $output_to_image));

        if ($return_var_to_image !== 0) {
            throw new Exception('PDF to Grayscale Image conversion failed (Step 2). Ghostscript return code: ' . $return_var_to_image . '. Output: ' . implode("\n", $output_to_image));
        }
        if (file_exists($temp_normalized_pdf_path)) {
            unlink($temp_normalized_pdf_path);
        }

        // --- Step 3: Convert Grayscale Images back to Grayscale PDF ---
        $output_grayscale_pdf_name = uniqid('grayscale_pdf_') . '.pdf';
        $output_grayscale_pdf_path = $temp_output_dir . $output_grayscale_pdf_name;

        // Find all generated images
        $image_base_name = str_replace(['%d.jpg', '%d.png'], '', basename($temp_grayscale_image_path));
        $generated_image_files = [];
        $all_files_in_dir = scandir($temp_output_dir);
        foreach ($all_files_in_dir as $file) {
            if (strpos($file, $image_base_name) === 0 && strtolower(pathinfo($file, PATHINFO_EXTENSION)) === 'jpg') {
                $generated_image_files[] = $temp_output_dir . $file;
            }
        }
        sort($generated_image_files, SORT_NATURAL); // Sort to ensure pages are in order

        if (empty($generated_image_files)) {
            throw new Exception('No grayscale images were generated to convert to PDF.');
        }

        // Concatenate all image paths for Ghostscript input
        $images_input_string = implode(' ', array_map('escapeshellarg', $generated_image_files));

        // Use pdfwrite again to create a PDF from the grayscale images
        $gs_command_images_to_pdf = $gs_executable_path . ' -dNOPAUSE -dBATCH -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -sOutputFile=' . escapeshellarg($output_grayscale_pdf_path) . ' ' . $images_input_string . ' 2>&1';

        $output_images_to_pdf = null;
        $return_var_images_to_pdf = null;
        exec($gs_command_images_to_pdf, $output_images_to_pdf, $return_var_images_to_pdf);

        error_log('Grayscale Images to PDF (Step 3) Ghostscript Command: ' . $gs_command_images_to_pdf);
        error_log('Grayscale Images to PDF (Step 3) Ghostscript Return Var: ' . $return_var_images_to_pdf);
        error_log('Grayscale Images to PDF (Step 3) Ghostscript Output: ' . implode("\n", $output_images_to_pdf));

        if ($return_var_images_to_pdf !== 0 || !file_exists($output_grayscale_pdf_path) || filesize($output_grayscale_pdf_path) === 0) {
            throw new Exception('Grayscale Images to PDF conversion failed (Step 3). Ghostscript return code: ' . $return_var_images_to_pdf . '. Output: ' . implode("\n", $output_images_to_pdf));
        }

        // Clean up all generated grayscale images
        foreach ($generated_image_files as $img_path) {
            if (file_exists($img_path)) {
                unlink($img_path);
            }
        }

        $download_url = str_replace('\\', '/', $upload_dir['baseurl']) . '/temp_conversions/' . basename($output_grayscale_pdf_path);

        wp_send_json_success(array(
            'message' => 'PDF converted to Grayscale successfully!',
            'download_url' => $download_url
        ));
    } catch (Exception $e) {
        // Clean up all temporary files on error
        if (file_exists($temp_input_pdf_path)) {
            unlink($temp_input_pdf_path);
        }
        if (file_exists($temp_normalized_pdf_path)) {
            unlink($temp_normalized_pdf_path);
        }
        if (file_exists($temp_grayscale_image_path)) { // Clean up images if pattern exists
            $image_base_name = str_replace(['%d.jpg'], '', basename($temp_grayscale_image_path));
            $all_files_in_dir = scandir($temp_output_dir);
            foreach ($all_files_in_dir as $file) {
                if (strpos($file, $image_base_name) === 0 && strtolower(pathinfo($file, PATHINFO_EXTENSION)) === 'jpg') {
                    unlink($temp_output_dir . $file);
                }
            }
        }
        if (file_exists($output_grayscale_pdf_path)) {
            unlink($output_grayscale_pdf_path);
        }
        wp_send_json_error(array('message' => 'Conversion failed: ' . $e->getMessage()));
    }
}

/**
 * AJAX handler for PDF to HTML (via Images) conversion.
 */
add_action('wp_ajax_dw_pdf_to_html', 'dw_pdf_to_html_callback');
add_action('wp_ajax_nopriv_dw_pdf_to_html', 'dw_pdf_to_html_callback');

function dw_pdf_to_html_callback()
{
    check_ajax_referer('dw_pdf_to_html_nonce', 'nonce');

    if (empty($_FILES['pdf_file']['name'])) {
        wp_send_json_error(array('message' => 'No PDF file selected.'));
    }

    $uploaded_file = $_FILES['pdf_file'];
    $upload_dir = wp_upload_dir();
    $upload_path = $upload_dir['basedir'] . '/';

    $temp_input_pdf_path = '';
    $temp_output_dir = $upload_path . 'temp_conversions/';
    $generated_images = []; // To store paths of generated images
    $output_html_path = ''; // Initialize for finally block

    try {
        // Ensure temp_conversions directory exists
        if (!is_dir($temp_output_dir)) {
            mkdir($temp_output_dir, 0755, true);
        }

        if ($uploaded_file['error'] === UPLOAD_ERR_OK) {
            $file_ext = pathinfo($uploaded_file['name'], PATHINFO_EXTENSION);
            if (strtolower($file_ext) !== 'pdf') {
                throw new Exception('Invalid file type. Only PDF files are supported.');
            }

            $temp_input_pdf_name = uniqid('uploaded_pdf_') . '.pdf';
            $temp_input_pdf_path = $temp_output_dir . $temp_input_pdf_name;

            if (!move_uploaded_file($uploaded_file['tmp_name'], $temp_input_pdf_path)) {
                throw new Exception('Failed to move uploaded file.');
            }
        } else {
            throw new Exception('File upload error.');
        }

        if (!file_exists($temp_input_pdf_path) || !is_readable($temp_input_pdf_path)) {
            throw new Exception('Cannot read the uploaded PDF file.');
        }

        // ** Dynamically get Ghostscript executable path from wp-config.php **
        if (!defined('DW_GHOSTSCRIPT_PATH')) {
            // Fallback if constant is not defined (shouldn't happen with proper wp-config.php updates)
            $gs_executable_temp = 'gs'; // Assume 'gs' is in PATH as a last resort
            error_log('DW_GHOSTSCRIPT_PATH not defined in PDF to HTML callback. Using default "gs" fallback.');
        } else {
            $gs_executable_temp = DW_GHOSTSCRIPT_PATH;
        }

        // Escape the executable path for safe shell execution
        $gs_executable_path_for_command = escapeshellarg($gs_executable_temp);


        // --- Step 1: Convert PDF pages to JPG images ---
        // Output image file pattern (Ghostscript will add page numbers)
        $output_img_pattern = $temp_output_dir . uniqid('pdf_page_') . '_%d.jpg'; // %d is for page number

        // Ghostscript command for PDF to JPG conversion
        $gs_command_images = $gs_executable_path_for_command . ' -dNOPAUSE -dBATCH -sDEVICE=jpeg -r300 -o ' . escapeshellarg($output_img_pattern) . ' ' . escapeshellarg($temp_input_pdf_path) . ' 2>&1';

        $output_gs = null;
        $return_var_gs = null;
        exec($gs_command_images, $output_gs, $return_var_gs);

        error_log('PDF to HTML (Images) Ghostscript Command: ' . $gs_command_images);
        error_log('PDF to HTML (Images) Ghostscript Return Var: ' . $return_var_gs);
        error_log('PDF to HTML (Images) Ghostscript Output: ' . implode("\n", $output_gs));

        if ($return_var_gs !== 0) {
            throw new Exception('Image conversion failed. Ghostscript return code: ' . $return_var_gs . '. Output: ' . implode("\n", $output_gs));
        }

        // --- Step 2: Generate HTML wrapper ---
        $html_content = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Converted PDF to HTML</title><style>body { margin: 0; padding: 0; background-color: #f0f0f0; } .pdf-page-image { display: block; max-width: 100%; height: auto; margin: 10px auto; border: 1px solid #ccc; box-shadow: 0 0 5px rgba(0,0,0,0.2); }</style></head><body>';

        // Find all generated images
        // The unique ID part for the image files will be the part before '_%d.jpg'
        $unique_id_for_images = basename(str_replace(['_%d.jpg', '%d.png'], '', $output_img_pattern));
        $all_files_in_dir = scandir($temp_output_dir);

        $image_urls = [];
        foreach ($all_files_in_dir as $file) {
            // Check if file starts with the unique ID and ends with .jpg (case-insensitive)
            if (strpos($file, $unique_id_for_images) === 0 && strtolower(pathinfo($file, PATHINFO_EXTENSION)) === 'jpg') {
                $generated_images[] = $temp_output_dir . $file; // Store full path for cleanup
                $image_urls[] = $upload_dir['baseurl'] . '/temp_conversions/' . $file; // Store URL for HTML
            }
        }

        // Sort images by page number to ensure correct order (e.g., page_1.jpg, page_10.jpg, page_2.jpg -> page_1.jpg, page_2.jpg, page_10.jpg)
        sort($image_urls, SORT_NATURAL);

        if (empty($image_urls)) {
            throw new Exception('No images were generated from the PDF. The PDF might be empty or problematic.');
        }

        foreach ($image_urls as $img_url) {
            $html_content .= '<img src="' . esc_url($img_url) . '" class="pdf-page-image" alt="PDF Page">';
        }

        $html_content .= '</body></html>';

        // Save the HTML content to a file
        $output_html_name = uniqid('converted_pdf_') . '.html';
        $output_html_path = $temp_output_dir . $output_html_name;
        file_put_contents($output_html_path, $html_content);

        if (!file_exists($output_html_path) || filesize($output_html_path) === 0) {
            throw new Exception('HTML file generation failed or is empty.');
        }

        $download_url = $upload_dir['baseurl'] . '/temp_conversions/' . basename($output_html_path);

        wp_send_json_success(array(
            'message' => 'PDF converted to HTML successfully!',
            'download_url' => $download_url
        ));
    } catch (Exception $e) {
        error_log('PDF to HTML Conversion Exception: ' . $e->getMessage());
        wp_send_json_error(array('message' => 'Conversion failed: ' . $e->getMessage()));
    } finally {
        // Clean up original uploaded PDF
        if (file_exists($temp_input_pdf_path)) {
            unlink($temp_input_pdf_path);
        }
        // Clean up generated images
        foreach ($generated_images as $img_path) {
            if (file_exists($img_path)) {
                unlink($img_path);
            }
        }
        // Clean up output HTML file on error (if it was created)
        if (file_exists($output_html_path)) {
            unlink($output_html_path);
        }
    }
}
/**
 * AJAX handler for Repair PDF.
 */
add_action('wp_ajax_dw_repair_pdf', 'dw_repair_pdf_callback');
add_action('wp_ajax_nopriv_dw_repair_pdf', 'dw_repair_pdf_callback');

function dw_repair_pdf_callback()
{
    check_ajax_referer('dw_repair_pdf_nonce', 'nonce');

    if (empty($_FILES['pdf_file']['name'])) {
        wp_send_json_error(array('message' => 'No PDF file selected.'));
    }

    $uploaded_file = $_FILES['pdf_file'];
    $upload_dir = wp_upload_dir();
    $upload_path = $upload_dir['basedir'] . '/';

    $temp_input_pdf_path = '';
    $temp_output_dir = $upload_path . 'temp_conversions/';
    $output_repaired_pdf_path = ''; // Initialize for finally block

    try {
        // Ensure temp_conversions directory exists
        if (!is_dir($temp_output_dir)) {
            mkdir($temp_output_dir, 0755, true);
        }

        if ($uploaded_file['error'] === UPLOAD_ERR_OK) {
            $file_ext = pathinfo($uploaded_file['name'], PATHINFO_EXTENSION);
            if (strtolower($file_ext) !== 'pdf') {
                throw new Exception('Invalid file type. Only PDF files are supported.');
            }

            $temp_input_pdf_name = uniqid('uploaded_pdf_') . '.pdf';
            $temp_input_pdf_path = $temp_output_dir . $temp_input_pdf_name;

            if (!move_uploaded_file($uploaded_file['tmp_name'], $temp_input_pdf_path)) {
                throw new Exception('Failed to move uploaded file.');
            }
        } else {
            throw new Exception('File upload error.');
        }

        if (!file_exists($temp_input_pdf_path) || !is_readable($temp_input_pdf_path)) {
            throw new Exception('Cannot read the uploaded PDF file.');
        }

        // ** Dynamically get Ghostscript executable path from wp-config.php **
        if (!defined('DW_GHOSTSCRIPT_PATH')) {
            // Fallback if constant is not defined (shouldn't happen with proper wp-config.php updates)
            $gs_executable_temp = 'gs'; // Assume 'gs' is in PATH as a last resort
            error_log('DW_GHOSTSCRIPT_PATH not defined in Repair PDF callback. Using default "gs" fallback.');
        } else {
            $gs_executable_temp = DW_GHOSTSCRIPT_PATH;
        }

        // Escape the executable path for safe shell execution
        $gs_executable_path_for_command = escapeshellarg($gs_executable_temp);


        // Define output repaired PDF file path
        $output_repaired_pdf_name = uniqid('repaired_pdf_') . '.pdf';
        $output_repaired_pdf_path = $temp_output_dir . $output_repaired_pdf_name;

        // Ghostscript command to "repair" a PDF by re-rendering it
        $gs_command = $gs_executable_path_for_command . ' -dNOPAUSE -dBATCH -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -sOutputFile=' . escapeshellarg($output_repaired_pdf_path) . ' ' . escapeshellarg($temp_input_pdf_path) . ' 2>&1';

        $output = null;
        $return_var = null;
        exec($gs_command, $output, $return_var);

        // Debugging logs - essential for troubleshooting Ghostscript issues
        error_log('Repair PDF Ghostscript Command: ' . $gs_command);
        error_log('Repair PDF Ghostscript Return Var: ' . $return_var);
        error_log('Repair PDF Ghostscript Output: ' . implode("\n", $output));

        if ($return_var !== 0 || !file_exists($output_repaired_pdf_path) || filesize($output_repaired_pdf_path) === 0) {
            throw new Exception('PDF repair failed. Ghostscript return code: ' . $return_var . '. Output: ' . implode("\n", $output));
        }

        $download_url = $upload_dir['baseurl'] . '/temp_conversions/' . basename($output_repaired_pdf_path);

        wp_send_json_success(array(
            'message' => 'PDF repaired successfully!',
            'download_url' => $download_url
        ));
    } catch (Exception $e) {
        error_log('PDF Repair Exception: ' . $e->getMessage());
        wp_send_json_error(array('message' => 'Repair failed: ' . $e->getMessage()));
    } finally {
        // Clean up original uploaded PDF
        if (file_exists($temp_input_pdf_path)) {
            unlink($temp_input_pdf_path);
        }
        // Clean up output repaired PDF file on error (if it was created)
        if (file_exists($output_repaired_pdf_path)) {
            unlink($output_repaired_pdf_path);
        }
    }
}

/**
 * AJAX handler for converting Word to PDF using LibreOffice (conceptual).
 */
add_action('wp_ajax_dw_word_to_pdf', 'dw_word_to_pdf_callback');
add_action('wp_ajax_nopriv_dw_word_to_pdf', 'dw_word_to_pdf_callback');

function dw_word_to_pdf_callback()
{
    check_ajax_referer('dw_word_to_pdf_nonce', 'nonce');

    if (empty($_FILES['office_file']['name'])) {
        wp_send_json_error(array('message' => 'No Word file selected.'));
    }

    $uploaded_file = $_FILES['office_file'];
    $upload_dir = wp_upload_dir();
    $upload_path = $upload_dir['basedir'] . '/';

    $temp_input_file_path = '';
    $temp_output_dir = $upload_path . 'temp_conversions/'; // A dedicated temp dir for conversions

    try {
        // Ensure temp_conversions directory exists
        if (!is_dir($temp_output_dir)) {
            mkdir($temp_output_dir, 0755, true);
        }

        if ($uploaded_file['error'] === UPLOAD_ERR_OK) {
            $file_ext = pathinfo($uploaded_file['name'], PATHINFO_EXTENSION);
            if (!in_array(strtolower($file_ext), ['doc', 'docx'])) {
                throw new Exception('Invalid file type. Only .doc and .docx are supported.');
            }

            $temp_input_file_name = uniqid('uploaded_word_') . '.' . $file_ext;
            $temp_input_file_path = $temp_output_dir . $temp_input_file_name;

            if (!move_uploaded_file($uploaded_file['tmp_name'], $temp_input_file_path)) {
                throw new Exception('Failed to move uploaded file.');
            }
        } else {
            throw new Exception('File upload error.');
        }

        if (!file_exists($temp_input_file_path) || !is_readable($temp_input_file_path)) {
            throw new Exception('Cannot read the uploaded Word file.');
        }

        // --- LibreOffice Command (Conceptual) ---
        // This command assumes LibreOffice is installed and its 'soffice' executable
        // is in the server's PATH, or you provide the full path to it.
        // On Linux: 'soffice'
        // On Windows: 'C:\Program Files\LibreOffice\program\soffice.exe' (or similar)
        $soffice_executable = 'soffice'; // Or full path like 'C:\Program Files\LibreOffice\program\soffice.exe'

        $output_pdf_name = uniqid('converted_word_') . '.pdf';
        // LibreOffice outputs to the same directory as the input file by default if --outdir is used.
        $command = $soffice_executable . ' --headless --convert-to pdf ' . escapeshellarg($temp_input_file_path) . ' --outdir ' . escapeshellarg($temp_output_dir) . ' 2>&1';

        $output = null;
        $return_var = null;
        exec($command, $output, $return_var);

        $converted_pdf_path = $temp_output_dir . pathinfo($temp_input_file_path, PATHINFO_FILENAME) . '.pdf';
        $converted_pdf_url = $upload_dir['baseurl'] . '/temp_conversions/' . basename($converted_pdf_path);

        if ($return_var !== 0 || !file_exists($converted_pdf_path) || filesize($converted_pdf_path) === 0) {
            throw new Exception('Word to PDF conversion failed. LibreOffice return code: ' . $return_var . '. Output: ' . implode("\n", $output) . '. Converted file not found or empty: ' . $converted_pdf_path);
        }

        // Clean up original uploaded file
        if (file_exists($temp_input_file_path)) {
            unlink($temp_input_file_path);
        }

        wp_send_json_success(array(
            'message' => 'Word document converted to PDF successfully!',
            'download_url' => $converted_pdf_url
        ));
    } catch (Exception $e) {
        // Clean up files on error
        if (file_exists($temp_input_file_path)) {
            unlink($temp_input_file_path);
        }
        // Also try to clean up the converted PDF if it was partially created
        if (isset($converted_pdf_path) && file_exists($converted_pdf_path)) {
            unlink($converted_pdf_path);
        }
        wp_send_json_error(array('message' => 'Conversion failed: ' . $e->getMessage()));
    }
}

/**
 * AJAX handler for merging PDFs using FPDI.
 */
add_action('wp_ajax_dw_merge_pdfs', 'dw_merge_pdfs_callback');
add_action('wp_ajax_nopriv_dw_merge_pdfs', 'dw_merge_pdfs_callback'); // Allow non-logged-in users

function dw_merge_pdfs_callback()
{
    // 1. Verify nonce for security
    check_ajax_referer('dw_merge_nonce', 'nonce');

    // 2. Handle uploaded files
    if (empty($_FILES['pdf_files']['name'][0])) {
        wp_send_json_error(array('message' => 'No PDF files selected for merging.'));
    }

    $uploaded_files = $_FILES['pdf_files'];
    $pdf_paths = array();
    $upload_dir = wp_upload_dir();
    $upload_path = $upload_dir['basedir'] . '/'; // Absolute path to uploads directory

    // Create an instance of FPDI
    $pdf = new Fpdi();

    try {
        // Loop through uploaded files
        foreach ($uploaded_files['name'] as $key => $name) {
            $tmp_name = $uploaded_files['tmp_name'][$key];
            $error = $uploaded_files['error'][$key];
            $type = $uploaded_files['type'][$key];

            if ($error === UPLOAD_ERR_OK && $type === 'application/pdf') {
                // Generate a unique temporary filename for the uploaded PDF
                $temp_pdf_name = uniqid('uploaded_') . '.pdf';
                $temp_pdf_path = $upload_path . $temp_pdf_name;

                // Move the uploaded file to a temporary location
                if (move_uploaded_file($tmp_name, $temp_pdf_path)) {
                    $pdf_paths[] = $temp_pdf_path; // Store path for merging
                } else {
                    throw new Exception('Failed to move uploaded file: ' . $name);
                }
            } else {
                // Handle upload errors or non-PDF files
                // UPLOAD_ERR_NO_FILE is common if no file was selected for an array input.
                if ($error !== UPLOAD_ERR_NO_FILE) {
                    throw new Exception('File upload error or not a PDF: ' . $name . ' (Error code: ' . $error . ')');
                }
            }
        }

        if (empty($pdf_paths)) {
            throw new Exception('No valid PDF files were uploaded or processed for merging.');
        }

        // --- Start Merging Logic with FPDI ---
        foreach ($pdf_paths as $file_path) {
            // Check if file exists and is readable
            if (!file_exists($file_path) || !is_readable($file_path)) {
                throw new Exception('Cannot read PDF file: ' . $file_path);
            }

            // Set the source file and import pages
            $pageCount = $pdf->setSourceFile($file_path);
            for ($i = 1; $i <= $pageCount; $i++) {
                $tplId = $pdf->importPage($i);
                // Get the size of the imported page to set the correct page dimensions
                $size = $pdf->getTemplateSize($tplId);
                // Add a new page to the output PDF with correct dimensions and orientation
                $pdf->AddPage($size['orientation'], [$size['width'], $size['height']]);
                $pdf->useTemplate($tplId); // Use the imported page as a template
            }
        }

        // Define the output filename for the merged PDF
        $merged_filename = 'merged_pdf_' . time() . '.pdf';
        $merged_filepath = $upload_path . $merged_filename;
        $merged_file_url = $upload_dir['baseurl'] . '/' . $merged_filename;

        // Output the merged PDF to the file system
        $pdf->Output($merged_filepath, 'F'); // 'F' saves to a local file

        // --- End Merging Logic with FPDI ---

        // 3. Clean up temporary uploaded files (important!)
        foreach ($pdf_paths as $path) {
            if (file_exists($path)) {
                unlink($path);
            }
        }

        // 4. Send success response with the download URL
        wp_send_json_success(array(
            'message' => 'PDFs merged successfully!',
            'download_url' => $merged_file_url
        ));
    } catch (Exception $e) {
        // Clean up temporary files even on error
        foreach ($pdf_paths as $path) {
            if (file_exists($path)) {
                unlink($path);
            }
        }
        wp_send_json_error(array('message' => 'Merging failed: ' . $e->getMessage()));
    }
}

/**
 * AJAX handler for splitting PDFs using FPDI.
 */
add_action('wp_ajax_dw_split_pdfs', 'dw_split_pdfs_callback');
add_action('wp_ajax_nopriv_dw_split_pdfs', 'dw_split_pdfs_callback'); // Allow non-logged-in users

function dw_split_pdfs_callback()
{
    error_log('dw_split_pdfs_callback: Function started.');

    check_ajax_referer('dw_split_nonce', 'nonce');

    if (empty($_FILES['pdf_file']['name'])) {
        error_log('dw_split_pdfs_callback: No PDF file selected.');
        wp_send_json_error(array('message' => 'No PDF file selected for splitting.'));
    }

    $uploaded_file = $_FILES['pdf_file'];
    $upload_dir = wp_upload_dir();
    $upload_path = $upload_dir['basedir'] . '/';

    $temp_pdf_path = ''; // Initialize for cleanup

    try {
        if ($uploaded_file['error'] === UPLOAD_ERR_OK && $uploaded_file['type'] === 'application/pdf') {
            $temp_pdf_name = uniqid('uploaded_split_') . '.pdf';
            $temp_pdf_path = $upload_path . $temp_pdf_name;
            error_log('dw_split_pdfs_callback: Attempting to move uploaded file to: ' . $temp_pdf_path);
            error_log('dw_split_pdfs_callback: Uploaded file tmp_name: ' . $uploaded_file['tmp_name']);
            error_log('dw_split_pdfs_callback: Uploaded file size: ' . $uploaded_file['size']);


            if (!move_uploaded_file($uploaded_file['tmp_name'], $temp_pdf_path)) {
                throw new Exception('Failed to move uploaded file.');
            }
            error_log('dw_split_pdfs_callback: Uploaded file moved successfully to: ' . $temp_pdf_path);
        } else {
            error_log('dw_split_pdfs_callback: File upload error or not a PDF. Error code: ' . $uploaded_file['error'] . ', Type: ' . $uploaded_file['type']);
            throw new Exception('File upload error or not a PDF. Error code: ' . $uploaded_file['error'] . ', Reported type: ' . $uploaded_file['type']);
        }

        // Detailed checks for the temporary file
        error_log('dw_split_pdfs_callback: Checking file status before setSourceFile().');
        error_log('dw_split_pdfs_callback: file_exists($temp_pdf_path): ' . (file_exists($temp_pdf_path) ? 'true' : 'false'));
        error_log('dw_split_pdfs_callback: is_readable($temp_pdf_path): ' . (is_readable($temp_pdf_path) ? 'true' : 'false'));
        error_log('dw_split_pdfs_callback: filesize($temp_pdf_path): ' . (file_exists($temp_pdf_path) ? filesize($temp_pdf_path) . ' bytes' : 'N/A'));

        if (!file_exists($temp_pdf_path) || !is_readable($temp_pdf_path) || filesize($temp_pdf_path) === 0) {
            $error_detail = 'File exists: ' . (file_exists($temp_pdf_path) ? 'Yes' : 'No') .
                ', Is readable: ' . (is_readable($temp_pdf_path) ? 'Yes' : 'No') .
                ', File size: ' . (file_exists($temp_pdf_path) ? filesize($temp_pdf_path) : 'N/A') . ' bytes.';
            error_log('dw_split_pdfs_callback: Pre-setSourceFile check failed: ' . $error_detail);
            throw new Exception('Cannot read the uploaded PDF file for splitting or file is empty. Details: ' . $error_detail);
        }
        error_log('dw_split_pdfs_callback: Uploaded PDF file passed pre-setSourceFile checks.');


        // --- Start Splitting Logic with FPDI ---
        // First, get the page count using a temporary FPDI instance
        // This is done to know how many pages to loop through.
        $temp_parser_pdf = new Fpdi();
        try {
            $pageCount = $temp_parser_pdf->setSourceFile($temp_pdf_path);
        } catch (\setasign\Fpdi\PdfParser\PdfParserException $e) {
            error_log('dw_split_pdfs_callback: PdfParserException caught during initial page count: ' . $e->getMessage() . ' on line ' . $e->getLine() . ' in ' . $e->getFile());
            throw new Exception('PDF parsing error (initial page count): ' . $e->getMessage());
        } catch (\Throwable $e) {
            error_log('dw_split_pdfs_callback: Generic exception caught during initial page count: ' . $e->getMessage() . ' on line ' . $e->getLine() . ' in ' . $e->getFile());
            throw new Exception('An unexpected error occurred while reading PDF for page count: ' . $e->getMessage());
        }
        error_log('dw_split_pdfs_callback: Page count detected: ' . $pageCount);
        // We don't need $temp_parser_pdf after getting pageCount.
        unset($temp_parser_pdf);
        gc_collect_cycles();


        if ($pageCount === 0) {
            throw new Exception('The uploaded PDF has no pages or is corrupted. Page count: ' . $pageCount);
        }

        $split_files_data = array(); // To store info about each split PDF

        for ($i = 1; $i <= $pageCount; $i++) {
            error_log('dw_split_pdfs_callback: Processing page ' . $i);

            // Create a new PDF for each page
            $split_pdf = new Fpdi();

            // IMPORTANT: Set the source file for THIS NEW FPDI instance
            // This is the missing step that caused the error.
            try {
                $split_pdf->setSourceFile($temp_pdf_path); // Set source on the new instance
            } catch (\setasign\Fpdi\PdfParser\PdfParserException $e) {
                error_log('dw_split_pdfs_callback: PdfParserException caught during setSourceFile for page ' . $i . ': ' . $e->getMessage() . ' on line ' . $e->getLine() . ' in ' . $e->getFile());
                throw new Exception('PDF parsing error for page ' . $i . ': ' . $e->getMessage());
            } catch (\Throwable $e) {
                error_log('dw_split_pdfs_callback: Generic exception caught during setSourceFile for page ' . $i . ': ' . $e->getMessage() . ' on line ' . $e->getLine() . ' in ' . $e->getFile());
                throw new Exception('An unexpected error occurred while reading PDF for page ' . $i . ': ' . $e->getMessage());
            }

            error_log('dw_split_pdfs_callback: Importing page ' . $i);
            $tplId = $split_pdf->importPage($i, '/MediaBox'); // Import the specific page, using MediaBox
            $size = $split_pdf->getTemplateSize($tplId); // Get the dimensions of the imported page
            error_log('dw_split_pdfs_callback: Adding page ' . $i . ' with size ' . $size['width'] . 'x' . $size['height']);
            // Add a page with correct dimensions and orientation
            $split_pdf->AddPage($size['orientation'], [$size['width'], $size['height']]);
            $split_pdf->useTemplate($tplId); // Use the imported page as a template

            // Define output filename for each split PDF
            $split_filename = 'split_page_' . time() . '_p' . $i . '.pdf';
            $split_filepath = $upload_path . $split_filename;
            $split_file_url = $upload_dir['baseurl'] . '/' . $split_filename;

            error_log('dw_split_pdfs_callback: Saving page ' . $i . ' to: ' . $split_filepath);
            // Save the single-page PDF
            $split_pdf->Output($split_filepath, 'F');

            // Verify if the file was actually created and has content
            if (!file_exists($split_filepath) || filesize($split_filepath) === 0) {
                error_log('dw_split_pdfs_callback: Failed to create split PDF file for page ' . $i . '. Path: ' . $split_filepath . ', Size: ' . (file_exists($split_filepath) ? filesize($split_filepath) : 'N/A'));
                throw new Exception('Failed to create split PDF file for page ' . $i . ' at ' . $split_filepath . '. File not found or is empty.');
            }
            error_log('dw_split_pdfs_callback: Page ' . $i . ' saved successfully.');

            $split_files_data[] = array(
                'page_number' => $i,
                'download_url' => $split_file_url
            );

            // Explicitly destroy the FPDI object for the current page to free memory
            unset($split_pdf);
            // Run garbage collection (can help with memory for many iterations)
            gc_collect_cycles();
        }
        // --- End Splitting Logic with FPDI ---

        // Clean up original uploaded file
        if (file_exists($temp_pdf_path)) {
            unlink($temp_pdf_path);
            error_log('dw_split_pdfs_callback: Original uploaded file cleaned up.');
        }

        wp_send_json_success(array(
            'message' => 'PDF split successfully!',
            'split_files' => $split_files_data
        ));
        error_log('dw_split_pdfs_callback: Function completed successfully.');
    } catch (Exception $e) {
        error_log('dw_split_pdfs_callback: Error caught: ' . $e->getMessage() . ' on line ' . $e->getLine() . ' in ' . $e->getFile());
        // Clean up original uploaded file on error
        if (file_exists($temp_pdf_path)) {
            unlink($temp_pdf_path);
            error_log('dw_split_pdfs_callback: Original uploaded file cleaned up after error.');
        }
        wp_send_json_error(array('message' => 'Splitting failed: ' . $e->getMessage()));
    }
}

/**
 * AJAX handler for PDF to Text conversion.
 */
add_action('wp_ajax_dw_pdf_to_text', 'dw_pdf_to_text_callback');
add_action('wp_ajax_nopriv_dw_pdf_to_text', 'dw_pdf_to_text_callback');

function dw_pdf_to_text_callback()
{
    check_ajax_referer('dw_pdf_to_text_nonce', 'nonce');

    if (empty($_FILES['pdf_file']['name'])) {
        wp_send_json_error(array('message' => 'No PDF file selected.'));
    }

    $uploaded_file = $_FILES['pdf_file'];
    $upload_dir = wp_upload_dir();
    $upload_path = $upload_dir['basedir'] . '/';

    $temp_input_pdf_path = '';
    $temp_output_dir = $upload_path . 'temp_conversions/';
    $output_text_path = ''; // Initialize for finally block

    try {
        // Ensure temp_conversions directory exists
        if (!is_dir($temp_output_dir)) {
            mkdir($temp_output_dir, 0755, true);
        }

        if ($uploaded_file['error'] === UPLOAD_ERR_OK) {
            $file_ext = pathinfo($uploaded_file['name'], PATHINFO_EXTENSION);
            if (strtolower($file_ext) !== 'pdf') {
                throw new Exception('Invalid file type. Only PDF files are supported.');
            }

            $temp_input_pdf_name = uniqid('uploaded_pdf_') . '.pdf';
            $temp_input_pdf_path = $temp_output_dir . $temp_input_pdf_name;

            if (!move_uploaded_file($uploaded_file['tmp_name'], $temp_input_pdf_path)) {
                throw new Exception('Failed to move uploaded file.');
            }
        } else {
            throw new Exception('File upload error.');
        }

        if (!file_exists($temp_input_pdf_path) || !is_readable($temp_input_pdf_path)) {
            throw new Exception('Cannot read the uploaded PDF file.');
        }

        // ** Dynamically get Ghostscript executable path from wp-config.php **
        if (!defined('DW_GHOSTSCRIPT_PATH')) {
            // Fallback if constant is not defined (shouldn't happen with proper wp-config.php updates)
            $gs_executable_temp = 'gs'; // Assume 'gs' is in PATH as a last resort
            error_log('DW_GHOSTSCRIPT_PATH not defined in PDF to Text callback. Using default "gs" fallback.');
        } else {
            $gs_executable_temp = DW_GHOSTSCRIPT_PATH;
        }

        // Escape the executable path for safe shell execution
        $gs_executable_path_for_command = escapeshellarg($gs_executable_temp);


        // Define output .txt file path
        $output_text_name = uniqid('converted_pdf_') . '.txt';
        $output_text_path = $temp_output_dir . $output_text_name;

        // Ghostscript command for PDF to Text conversion
        // -sDEVICE=txtwrite: Specifies the text output device
        // -o: Output file
        $gs_command = $gs_executable_path_for_command . ' -dBATCH -dNOPAUSE -sDEVICE=txtwrite -o ' . escapeshellarg($output_text_path) . ' ' . escapeshellarg($temp_input_pdf_path) . ' 2>&1';

        $output = null;
        $return_var = null;
        exec($gs_command, $output, $return_var);

        // Debugging logs - essential for troubleshooting Ghostscript issues
        error_log('PDF to Text Ghostscript Command: ' . $gs_command);
        error_log('PDF to Text Ghostscript Return Var: ' . $return_var);
        error_log('PDF to Text Ghostscript Output: ' . implode("\n", $output));

        if ($return_var !== 0 || !file_exists($output_text_path) || filesize($output_text_path) === 0) {
            throw new Exception('PDF to Text conversion failed. Ghostscript return code: ' . $return_var . '. Output: ' . implode("\n", $output));
        }

        $download_url = $upload_dir['baseurl'] . '/temp_conversions/' . basename($output_text_path);

        wp_send_json_success(array(
            'message' => 'PDF converted to Text successfully!',
            'download_url' => $download_url
        ));
    } catch (Exception $e) {
        error_log('PDF to Text Conversion Exception: ' . $e->getMessage());
        wp_send_json_error(array('message' => 'Conversion failed: ' . $e->getMessage()));
    } finally {
        // Clean up original uploaded PDF
        if (file_exists($temp_input_pdf_path)) {
            unlink($temp_input_pdf_path);
        }
        // Clean up output text file on error (if it was created)
        if (file_exists($output_text_path)) {
            unlink($output_text_path);
        }
    }
}
/**
 * AJAX handler for compressing PDFs using Ghostscript.
 */
add_action('wp_ajax_dw_compress_pdfs', 'dw_compress_pdfs_callback');
add_action('wp_ajax_nopriv_dw_compress_pdfs', 'dw_compress_pdfs_callback'); // Allow non-logged-in users

function dw_compress_pdfs_callback()
{
    check_ajax_referer('dw_compress_nonce', 'nonce');

    if (empty($_FILES['pdf_file']['name'])) {
        wp_send_json_error(array('message' => 'No PDF file selected for compression.'));
    }

    $uploaded_file = $_FILES['pdf_file'];
    $upload_dir = wp_upload_dir();
    $upload_path = $upload_dir['basedir'] . '/';

    $temp_input_pdf_path = ''; // For cleanup
    $compressed_filepath = ''; // For cleanup

    try {
        if ($uploaded_file['error'] === UPLOAD_ERR_OK && $uploaded_file['type'] === 'application/pdf') {
            $temp_input_pdf_name = uniqid('uploaded_compress_') . '.pdf';
            $temp_input_pdf_path = $upload_path . $temp_input_pdf_name;

            if (!move_uploaded_file($uploaded_file['tmp_name'], $temp_input_pdf_path)) {
                throw new Exception('Failed to move uploaded file for compression.');
            }
        } else {
            throw new Exception('File upload error or not a PDF.');
        }

        if (!file_exists($temp_input_pdf_path) || !is_readable($temp_input_pdf_path)) {
            throw new Exception('Cannot read the uploaded PDF file for compression.');
        }

        // --- Start Compression Logic with Ghostscript ---
        $compressed_filename = 'compressed_pdf_' . time() . '.pdf';
        $compressed_filepath = $upload_path . $compressed_filename;
        $compressed_file_url = $upload_dir['baseurl'] . '/' . $compressed_filename;

        // ** Dynamically get Ghostscript executable path from wp-config.php **
        if (!defined('DW_GHOSTSCRIPT_PATH')) {
            // Fallback if constant is not defined (though it should be with wp-config.php updates)
            $gs_executable_path_temp = 'gs'; // Assume 'gs' is in PATH as a last resort
            error_log('DW_GHOSTSCRIPT_PATH not defined in compress callback. Using default "gs" fallback.');
        } else {
            $gs_executable_path_temp = DW_GHOSTSCRIPT_PATH;
        }

        // Escape the executable path for safe shell execution
        $gs_executable_path_for_command = escapeshellarg($gs_executable_path_temp);

        // Construct the Ghostscript command
        $gs_command = $gs_executable_path_for_command . ' -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -sOutputFile=' . escapeshellarg($compressed_filepath) . ' ' . escapeshellarg($temp_input_pdf_path) . ' 2>&1';

        // Log the command for debugging purposes (check your server's PHP error log)
        error_log('Ghostscript Compression Command: ' . $gs_command);

        $output = null;
        $return_var = null;
        exec($gs_command, $output, $return_var);

        // Log Ghostscript's raw output and return code for debugging
        error_log('Ghostscript Compression Return Var: ' . $return_var);
        error_log('Ghostscript Compression Output: ' . implode("\n", $output));

        if ($return_var !== 0) {
            // Ghostscript command failed
            throw new Exception('Ghostscript compression failed. Return code: ' . $return_var . '. Output: ' . implode("\n", $output));
        }

        if (!file_exists($compressed_filepath) || filesize($compressed_filepath) === 0) {
            throw new Exception('Compressed PDF file not created or is empty. Check Ghostscript installation/path and server permissions.');
        }
        // --- End Compression Logic ---

        // Clean up original uploaded file
        if (file_exists($temp_input_pdf_path)) {
            unlink($temp_input_pdf_path);
        }

        wp_send_json_success(array(
            'message' => 'PDF compressed successfully!',
            'download_url' => $compressed_file_url
        ));
    } catch (Exception $e) {
        // Clean up files on error
        if (file_exists($temp_input_pdf_path)) {
            unlink($temp_input_pdf_path);
        }
        if (file_exists($compressed_filepath)) { // Also clean up partially created compressed file
            unlink($compressed_filepath);
        }
        error_log('PDF Compression Exception: ' . $e->getMessage()); // Log detailed exception
        wp_send_json_error(array('message' => 'Compression failed: ' . $e->getMessage()));
    }
}
/**
 * AJAX handler for converting PDF to JPG using Ghostscript.
 */
add_action('wp_ajax_dw_pdf_to_jpg', 'dw_pdf_to_jpg_callback');
add_action('wp_ajax_nopriv_dw_pdf_to_jpg', 'dw_pdf_to_jpg_callback'); // Allow non-logged-in users

function dw_pdf_to_jpg_callback()
{
    // You'll need to create a nonce for this action and pass it from the frontend.
    // For simplicity, I'm omitting nonce checking here, but it's crucial for security.
    // check_ajax_referer('dw_pdf_to_jpg_nonce', 'nonce');

    if (empty($_FILES['pdf_file']['name'])) {
        wp_send_json_error(array('message' => 'No PDF file selected for conversion.'));
    }

    $uploaded_file = $_FILES['pdf_file'];
    $jpg_quality = isset($_POST['jpg_quality']) ? intval($_POST['jpg_quality']) : 90;
    if ($jpg_quality < 1 || $jpg_quality > 100) {
        $jpg_quality = 90; // Default to 90 if invalid
    }

    $upload_dir = wp_upload_dir();
    $upload_path = $upload_dir['basedir'] . '/';
    $upload_url = $upload_dir['baseurl'] . '/';

    $temp_input_pdf_path = ''; // For cleanup
    $output_dir = ''; // For cleanup

    try {
        if ($uploaded_file['error'] === UPLOAD_ERR_OK && $uploaded_file['type'] === 'application/pdf') {
            $temp_input_pdf_name = uniqid('uploaded_convert_') . '.pdf';
            $temp_input_pdf_path = $upload_path . $temp_input_pdf_name;

            if (!move_uploaded_file($uploaded_file['tmp_name'], $temp_input_pdf_path)) {
                throw new Exception('Failed to move uploaded file for conversion.');
            }
        } else {
            throw new Exception('File upload error or not a PDF.');
        }

        if (!file_exists($temp_input_pdf_path) || !is_readable($temp_input_pdf_path)) {
            throw new Exception('Cannot read the uploaded PDF file for conversion.');
        }

        // --- Start Conversion Logic with Ghostscript ---
        $unique_id = uniqid('pdf_to_jpg_');
        $output_dir = $upload_path . $unique_id . '/';
        wp_mkdir_p($output_dir); // Create a directory for JPGs

        if (!is_dir($output_dir) || !is_writable($output_dir)) {
            throw new Exception('Failed to create or write to output directory for JPGs.');
        }

        // Ghostscript executable path (same logic as in compress)
        $gs_executable_path = 'gswin64c';
        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            $possible_gs_paths = [
                'DW_GHOSTSCRIPT_PATH',
                'C:\Program Files (x86)\gs\gs9.56.1\bin\gswin32c.exe',
            ];
            foreach ($possible_gs_paths as $path) {
                if (file_exists($path)) {
                    $gs_executable_path = '"' . $path . '"';
                    break;
                }
            }
        } else {
            $gs_executable_path = 'gs';
        }

        if ($gs_executable_path === 'gswin64c' && strtoupper(substr(PHP_OS, 0, 3)) === 'WIN' && !file_exists(str_replace('"', '', $gs_executable_path))) {
            throw new Exception('Ghostscript executable (gswin64c) not found. Please specify the full path or add it to your system\'s PATH.');
        }

        // Ghostscript command for PDF to JPG conversion
        // -sDEVICE=jpeg: output device is JPEG
        // -r300: resolution 300 DPI (dots per inch)
        // -dJPEGQ=QUALITY: JPEG quality (0-100)
        // -o: output file pattern (e.g., page-%d.jpg will create page-1.jpg, page-2.jpg, etc.)
        $gs_command = $gs_executable_path . ' -sDEVICE=jpeg -r300 -dJPEGQ=' . escapeshellarg($jpg_quality) . ' -dNOPAUSE -dBATCH -sOutputFile=' . escapeshellarg($output_dir . 'page-%d.jpg') . ' ' . escapeshellarg($temp_input_pdf_path) . ' 2>&1';

        $output = null;
        $return_var = null;
        exec($gs_command, $output, $return_var);

        if ($return_var !== 0) {
            throw new Exception('Ghostscript conversion failed. Return code: ' . $return_var . '. Output: ' . implode("\n", $output));
        }

        // Collect generated JPG files
        $jpg_files = glob($output_dir . '*.jpg');
        $download_urls = [];
        if (!empty($jpg_files)) {
            foreach ($jpg_files as $jpg_file) {
                $filename = basename($jpg_file);
                $download_urls[] = $upload_url . $unique_id . '/' . $filename;
            }
        } else {
            throw new Exception('No JPG files were generated. Check PDF content or Ghostscript output.');
        }
        // --- End Conversion Logic ---

        // Clean up original uploaded file
        if (file_exists($temp_input_pdf_path)) {
            unlink($temp_input_pdf_path);
        }

        wp_send_json_success(array(
            'message' => 'PDF converted to JPGs successfully!',
            'download_urls' => $download_urls
        ));
    } catch (Exception $e) {
        // Clean up files and directory on error
        if (file_exists($temp_input_pdf_path)) {
            unlink($temp_input_pdf_path);
        }
        if (is_dir($output_dir)) {
            // Function to recursively delete directory (from common WordPress practices)
            function dw_rrmdir($dir)
            {
                if (is_dir($dir)) {
                    $objects = scandir($dir);
                    foreach ($objects as $object) {
                        if ($object != "." && $object != "..") {
                            if (filetype($dir . "/" . $object) == "dir") dw_rrmdir($dir . "/" . $object);
                            else unlink($dir . "/" . $object);
                        }
                    }
                    reset($objects);
                    rmdir($dir);
                }
            }
            dw_rrmdir($output_dir);
        }
        wp_send_json_error(array('message' => 'Conversion failed: ' . $e->getMessage()));
    }
}
/**
 * AJAX handler for adding a text watermark to a PDF.
 */
add_action('wp_ajax_dw_add_watermark', 'dw_add_watermark_callback');
add_action('wp_ajax_nopriv_dw_add_watermark', 'dw_add_watermark_callback'); // Allow non-logged-in users

function dw_add_watermark_callback()
{
    check_ajax_referer('dw_add_watermark_nonce', 'nonce');

    if (empty($_FILES['pdf_file']['name'])) {
        wp_send_json_error(array('message' => 'No PDF file selected for watermarking.'));
    }
    if (empty($_POST['watermark_text'])) {
        wp_send_json_error(array('message' => 'No watermark text provided.'));
    }

    $uploaded_file = $_FILES['pdf_file'];
    $watermark_text = sanitize_text_field($_POST['watermark_text']);
    $font_size = isset($_POST['font_size']) ? intval($_POST['font_size']) : 50;
    $opacity = isset($_POST['opacity']) ? intval($_POST['opacity']) : 20; // 0-100

    // Clamp font size and opacity
    $font_size = max(10, min(200, $font_size));
    $opacity = max(0, min(100, $opacity));
    $alpha = $opacity / 100; // Convert to 0-1 range for FPDI/FPDF

    $upload_dir = wp_upload_dir();
    $upload_path = $upload_dir['basedir'] . '/';

    $temp_input_pdf_path = ''; // For cleanup

    try {
        if ($uploaded_file['error'] === UPLOAD_ERR_OK && $uploaded_file['type'] === 'application/pdf') {
            $temp_input_pdf_name = uniqid('uploaded_watermark_') . '.pdf';
            $temp_input_pdf_path = $upload_path . $temp_input_pdf_name;

            if (!move_uploaded_file($uploaded_file['tmp_name'], $temp_input_pdf_path)) {
                throw new Exception('Failed to move uploaded file for watermarking.');
            }
        } else {
            throw new Exception('File upload error or not a PDF.');
        }

        if (!file_exists($temp_input_pdf_path) || !is_readable($temp_input_pdf_path)) {
            throw new Exception('Cannot read the uploaded PDF file for watermarking.');
        }

        $pdf = new Fpdi();
        $pageCount = $pdf->setSourceFile($temp_input_pdf_path);

        for ($i = 1; $i <= $pageCount; $i++) {
            $tplId = $pdf->importPage($i, '/MediaBox');
            $size = $pdf->getTemplateSize($tplId);

            $pdf->AddPage($size['orientation'], [$size['width'], $size['height']]);
            $pdf->useTemplate($tplId);

            // Set font for watermark (e.g., Arial bold)
            $pdf->SetFont('Arial', 'B', $font_size);

            // Set text color with alpha (for transparency)
            // Note: FPDF's alpha transparency (SetAlpha) works well for graphic elements like fills/lines
            // but for text, it's more about how the PDF viewer renders it. True text transparency
            // can be complex without advanced libraries. This uses a workaround for FPDF.

            // FPDI uses FPDF, which does not natively support true alpha for text easily.
            // A common workaround is to use a specific color and rely on the viewer's blend modes
            // or to use an image watermark. For simplicity, we'll set a gray color.
            // For true alpha with text, you might need a different library or more complex PDF object manipulation.

            // Set text color to a light grey for a subtle effect
            // Convert alpha (0-1) to FPDF's 0-255 scale for colors (approximation)
            // Lower opacity means lighter color.
            $gray_shade = round(255 * (1 - $alpha)); // 255 (white) - (255 * alpha)
            $pdf->SetTextColor($gray_shade, $gray_shade, $gray_shade); // RGB values for grey

            // Calculate text width to center it
            $text_width = $pdf->GetStringWidth($watermark_text);

            // Position watermark diagonally (example)
            // You might need to adjust these values based on typical page sizes and desired appearance.
            // For a diagonal effect, you can try setting X and Y such that the text spans.
            // Or for a fixed position (e.g., center) and then rotate.

            // FPDF does not have a direct text rotation function easily applicable on the fly.
            // To achieve rotated text, you'd typically need to use a transformation matrix,
            // which FPDI allows via startTemplate and transformation methods, but it adds complexity.
            // For a simple, non-rotated watermark, we'll place it in the center.

            // Calculate center position
            $x = ($size['width'] - $text_width) / 2;
            $y = $size['height'] / 2;

            // Optional: For diagonal watermark, you'd typically apply a transformation matrix.
            // FPDF itself is limited. FPDI's template functionality is for importing, not arbitrary drawing transforms.
            // For a simple text watermark without rotation:
            $pdf->SetXY($x, $y);
            $pdf->Write(0, $watermark_text);

            // Reset text color for subsequent operations (though we're done here)
            $pdf->SetTextColor(0, 0, 0);
        }

        $watermarked_filename = 'watermarked_pdf_' . time() . '.pdf';
        $watermarked_filepath = $upload_path . $watermarked_filename;
        $watermarked_file_url = $upload_dir['baseurl'] . '/' . $watermarked_filename;

        $pdf->Output($watermarked_filepath, 'F');

        if (!file_exists($watermarked_filepath) || filesize($watermarked_filepath) === 0) {
            throw new Exception('Watermarked PDF file not created or is empty.');
        }

        // Clean up original uploaded file
        if (file_exists($temp_input_pdf_path)) {
            unlink($temp_input_pdf_path);
        }

        wp_send_json_success(array(
            'message' => 'Watermark added successfully!',
            'download_url' => $watermarked_file_url
        ));
    } catch (Exception $e) {
        // Clean up files on error
        if (file_exists($temp_input_pdf_path)) {
            unlink($temp_input_pdf_path);
        }
        wp_send_json_error(array('message' => 'Adding watermark failed: ' . $e->getMessage()));
    }
}
/**
 * AJAX handler for adding page numbers to PDF.
 */
add_action('wp_ajax_dw_add_page_numbers', 'dw_add_page_numbers_callback');
add_action('wp_ajax_nopriv_dw_add_page_numbers', 'dw_add_page_numbers_callback'); // Allow non-logged-in users

function dw_add_page_numbers_callback()
{
    // IMPORTANT: Always implement nonce check for security!
    // check_ajax_referer('dw_add_page_numbers_nonce', 'nonce');

    if (empty($_FILES['pdf_file']['name'])) {
        wp_send_json_error(array('message' => 'No PDF file selected.'));
        exit;
    }

    $uploaded_file = $_FILES['pdf_file'];
    $position = isset($_POST['position']) ? sanitize_text_field($_POST['position']) : 'bottom-right';

    $upload_dir = wp_upload_dir();
    $upload_path = $upload_dir['basedir'] . '/';

    $temp_input_pdf_path = ''; // For cleanup
    $output_pdf_filepath = ''; // For cleanup

    try {
        // 1. Handle the uploaded PDF file
        if ($uploaded_file['error'] !== UPLOAD_ERR_OK || $uploaded_file['type'] !== 'application/pdf') {
            throw new Exception('File upload error or not a PDF.');
        }

        $temp_input_pdf_name = uniqid('uploaded_pn_') . '.pdf';
        $temp_input_pdf_path = $upload_path . $temp_input_pdf_name;

        if (!move_uploaded_file($uploaded_file['tmp_name'], $temp_input_pdf_path)) {
            throw new Exception('Failed to move uploaded PDF file.');
        }

        if (!file_exists($temp_input_pdf_path) || !is_readable($temp_input_pdf_path)) {
            throw new Exception('Cannot read the uploaded PDF file for page numbering.');
        }

        // --- Start Page Numbering Logic with FPDI/FPDF ---
        $pdf = new Fpdi(); // Create a new PDF document

        // Set font for page numbers
        // You can customize the font (e.g., 'Arial', 'Times', 'Courier'), style (B for bold, I for italic), and size.
        $pdf->SetFont('Helvetica', '', 10);
        $pdf->SetTextColor(0, 0, 0); // Black color (RGB)

        // Get total pages from the source PDF
        $pageCount = $pdf->setSourceFile($temp_input_pdf_path);

        for ($i = 1; $i <= $pageCount; $i++) {
            $tplId = $pdf->importPage($i); // Import the current page from the source PDF
            $pdf->AddPage(); // Add a new page to the output PDF
            $pdf->useTemplate($tplId); // Use the imported page as a template

            // Calculate position for the page number
            $text = "Page " . $i . " of " . $pageCount;
            $text_width = $pdf->GetStringWidth($text);
            $margin = 10; // Margin from the edge of the page (in mm, FPDF's default unit)

            $page_width = $pdf->GetPageWidth();
            $page_height = $pdf->GetPageHeight();

            $x = 0;
            $y = 0;

            switch ($position) {
                case 'bottom-right':
                    $x = $page_width - $text_width - $margin;
                    $y = $page_height - $margin;
                    break;
                case 'bottom-center':
                    $x = ($page_width - $text_width) / 2;
                    $y = $page_height - $margin;
                    break;
                case 'bottom-left':
                    $x = $margin;
                    $y = $page_height - $margin;
                    break;
                case 'top-right':
                    $x = $page_width - $text_width - $margin;
                    $y = $margin;
                    break;
                case 'top-center':
                    $x = ($page_width - $text_width) / 2;
                    $y = $margin;
                    break;
                case 'top-left':
                    $x = $margin;
                    $y = $margin;
                    break;
                default: // Default to bottom-right
                    $x = $page_width - $text_width - $margin;
                    $y = $page_height - $margin;
                    break;
            }

            // Set the position and add the page number
            $pdf->SetXY($x, $y);
            $pdf->Write(0, $text); // Write the text. 0 means no specific line height, uses current font height.
        }

        // Save the new PDF with page numbers
        $output_pdf_filename = 'numbered_pdf_' . time() . '.pdf';
        $output_pdf_filepath = $upload_path . $output_pdf_filename;
        // 'F' saves the PDF to a local file
        $pdf->Output($output_pdf_filepath, 'F');

        if (!file_exists($output_pdf_filepath) || filesize($output_pdf_filepath) === 0) {
            throw new Exception('PDF with page numbers not created or is empty.');
        }
        // --- End Page Numbering Logic ---

        $download_url = $upload_dir['baseurl'] . '/' . $output_pdf_filename;
    } catch (Exception $e) {
        // Clean up files on error
        if (file_exists($temp_input_pdf_path)) {
            unlink($temp_input_pdf_path);
        }
        if (file_exists($output_pdf_filepath)) {
            unlink($output_pdf_filepath);
        }
        wp_send_json_error(array('message' => 'Failed to add page numbers: ' . $e->getMessage()));
        exit;
    }

    // Clean up temporary files on success
    if (file_exists($temp_input_pdf_path)) {
        unlink($temp_input_pdf_path);
    }

    wp_send_json_success(array(
        'message' => 'Page numbers added successfully!',
        'download_url' => $download_url
    ));
    exit;
}

/**
 * AJAX handler for rotating PDFs using FPDI.
 */
add_action('wp_ajax_dw_rotate_pdfs', 'dw_rotate_pdfs_callback');
add_action('wp_ajax_nopriv_dw_rotate_pdfs', 'dw_rotate_pdfs_callback'); // Allow non-logged-in users

function dw_rotate_pdfs_callback()
{
    check_ajax_referer('dw_rotate_nonce', 'nonce');

    if (empty($_FILES['pdf_file']['name'])) {
        wp_send_json_error(array('message' => 'No PDF file selected for rotation.'));
    }

    $uploaded_file = $_FILES['pdf_file'];
    $rotation_angle = isset($_POST['rotation_angle']) ? intval($_POST['rotation_angle']) : 0;

    // Validate rotation angle
    if (!in_array($rotation_angle, [90, 180, 270])) {
        wp_send_json_error(array('message' => 'Invalid rotation angle specified.'));
    }

    $upload_dir = wp_upload_dir();
    $upload_path = $upload_dir['basedir'] . '/';

    $temp_input_pdf_path = ''; // For cleanup

    try {
        if ($uploaded_file['error'] === UPLOAD_ERR_OK && $uploaded_file['type'] === 'application/pdf') {
            $temp_input_pdf_name = uniqid('uploaded_rotate_') . '.pdf';
            $temp_input_pdf_path = $upload_path . $temp_input_pdf_name;

            if (!move_uploaded_file($uploaded_file['tmp_name'], $temp_input_pdf_path)) {
                throw new Exception('Failed to move uploaded file for rotation.');
            }
        } else {
            throw new Exception('File upload error or not a PDF.');
        }

        if (!file_exists($temp_input_pdf_path) || !is_readable($temp_input_pdf_path)) {
            throw new Exception('Cannot read the uploaded PDF file for rotation.');
        }

        // Create an instance of FPDI
        $pdf = new Fpdi();

        $pageCount = $pdf->setSourceFile($temp_input_pdf_path);

        for ($i = 1; $i <= $pageCount; $i++) {
            $tplId = $pdf->importPage($i);
            $size = $pdf->getTemplateSize($tplId);

            // Add page with original dimensions, but specify rotation
            // FPDF AddPage: AddPage([string $orientation [, array|string $size [, int $rotation]]])
            // FPDI useTemplate: useTemplate(int $tplId, float $x = null, float $y = null, float $width = null, float $height = null, float $adjustPageSize = false, float $rotation = 0)
            // The rotation parameter in AddPage determines initial page orientation, not content rotation.
            // For content rotation, FPDI's useTemplate has a rotation parameter.

            // To handle page orientation correctly after rotation, we need to swap width/height if 90/270.
            $new_width = $size['width'];
            $new_height = $size['height'];
            $new_orientation = $size['orientation'];

            if ($rotation_angle == 90 || $rotation_angle == 270) {
                // Swap width and height if rotating by 90 or 270 degrees
                $new_width = $size['height'];
                $new_height = $size['width'];
                $new_orientation = ($size['orientation'] == 'P' ? 'L' : 'P'); // Adjust orientation text
            }

            $pdf->AddPage($new_orientation, [$new_width, $new_height]);
            $pdf->useTemplate($tplId, 0, 0, $size['width'], $size['height'], false, $rotation_angle);
        }

        $rotated_filename = 'rotated_pdf_' . time() . '.pdf';
        $rotated_filepath = $upload_path . $rotated_filename;
        $rotated_file_url = $upload_dir['baseurl'] . '/' . $rotated_filename;

        $pdf->Output($rotated_filepath, 'F');

        if (!file_exists($rotated_filepath) || filesize($rotated_filepath) === 0) {
            throw new Exception('Rotated PDF file not created or is empty.');
        }

        // Clean up original uploaded file
        if (file_exists($temp_input_pdf_path)) {
            unlink($temp_input_pdf_path);
        }

        wp_send_json_success(array(
            'message' => 'PDF rotated successfully!',
            'download_url' => $rotated_file_url
        ));
    } catch (Exception $e) {
        // Clean up files on error
        if (file_exists($temp_input_pdf_path)) {
            unlink($temp_input_pdf_path);
        }
        wp_send_json_error(array('message' => 'Rotation failed: ' . $e->getMessage()));
    }
}

/**
 * Helper function to parse page ranges (e.g., "1,3,5-7").
 * Returns an array of individual page numbers.
 */
function dw_parse_page_ranges($range_string, $total_pages)
{
    $pages = [];
    $parts = explode(',', $range_string);
    foreach ($parts as $part) {
        $part = trim($part);
        if (strpos($part, '-') !== false) {
            list($start, $end) = array_map('intval', explode('-', $part));
            for ($i = $start; $i <= $end; $i++) {
                if ($i >= 1 && $i <= $total_pages) {
                    $pages[] = $i;
                }
            }
        } else {
            $page_num = intval($part);
            if ($page_num >= 1 && $page_num <= $total_pages) {
                $pages[] = $page_num;
            }
        }
    }
    return array_unique($pages); // Return unique, sorted page numbers
}
/**
 * AJAX handler for deleting pages from a PDF.
 */
add_action('wp_ajax_dw_delete_pages', 'dw_delete_pages_callback');
add_action('wp_ajax_nopriv_dw_delete_pages', 'dw_delete_pages_callback'); // Allow non-logged-in users

function dw_delete_pages_callback()
{
    check_ajax_referer('dw_delete_pages_nonce', 'nonce');

    if (empty($_FILES['pdf_file']['name'])) {
        wp_send_json_error(array('message' => 'No PDF file selected.'));
    }
    if (empty($_POST['pages_to_delete'])) {
        wp_send_json_error(array('message' => 'No pages specified for deletion.'));
    }

    $uploaded_file = $_FILES['pdf_file'];
    $pages_to_delete_input = sanitize_text_field($_POST['pages_to_delete']);

    $upload_dir = wp_upload_dir();
    $upload_path = $upload_dir['basedir'] . '/';

    $temp_input_pdf_path = ''; // For cleanup

    try {
        if ($uploaded_file['error'] === UPLOAD_ERR_OK && $uploaded_file['type'] === 'application/pdf') {
            $temp_input_pdf_name = uniqid('uploaded_delete_') . '.pdf';
            $temp_input_pdf_path = $upload_path . $temp_input_pdf_name;

            if (!move_uploaded_file($uploaded_file['tmp_name'], $temp_input_pdf_path)) {
                throw new Exception('Failed to move uploaded file.');
            }
        } else {
            throw new Exception('File upload error or not a PDF.');
        }

        if (!file_exists($temp_input_pdf_path) || !is_readable($temp_input_pdf_path)) {
            throw new Exception('Cannot read the uploaded PDF file.');
        }

        // Initialize the FPDI object that will build the new PDF
        $new_pdf = new Fpdi();

        // Set the source file for this FPDI object.
        // This is crucial, as this object needs to read the input PDF to import pages.
        $pageCount = $new_pdf->setSourceFile($temp_input_pdf_path);
        // You can remove the old `$pdf_source` object and its `unset()` as it's no longer needed separately.

        $pages_to_delete = dw_parse_page_ranges($pages_to_delete_input, $pageCount);
        if (empty($pages_to_delete) && !empty($pages_to_delete_input)) {
            throw new Exception('No valid pages found in your input to delete. Please ensure pages exist within the PDF\'s range (1-' . $pageCount . ').');
        }

        $retained_pages_count = 0;

        for ($i = 1; $i <= $pageCount; $i++) {
            if (!in_array($i, $pages_to_delete)) {
                $tplId = $new_pdf->importPage($i, '/MediaBox');
                $size = $new_pdf->getTemplateSize($tplId);
                $new_pdf->AddPage($size['orientation'], [$size['width'], $size['height']]);
                $new_pdf->useTemplate($tplId);
                $retained_pages_count++;
            }
        }

        if ($retained_pages_count === 0) {
            throw new Exception('All pages were marked for deletion. The resulting PDF would be empty.');
        }

        $modified_filename = 'modified_pdf_' . time() . '.pdf';
        $modified_filepath = $upload_path . $modified_filename;
        $modified_file_url = $upload_dir['baseurl'] . '/' . $modified_filename;

        $new_pdf->Output($modified_filepath, 'F');

        if (!file_exists($modified_filepath) || filesize($modified_filepath) === 0) {
            throw new Exception('Modified PDF file not created or is empty.');
        }

        // Clean up original uploaded file
        if (file_exists($temp_input_pdf_path)) {
            unlink($temp_input_pdf_path);
        }

        wp_send_json_success(array(
            'message' => 'Pages deleted successfully! ' . $retained_pages_count . ' pages remaining.',
            'download_url' => $modified_file_url
        ));
    } catch (Exception $e) {
        // Clean up files on error
        if (file_exists($temp_input_pdf_path)) {
            unlink($temp_input_pdf_path);
        }
        wp_send_json_error(array('message' => 'Page deletion failed: ' . $e->getMessage()));
    }
}

/**
 * AJAX handler for reordering pages in a PDF.
 */
add_action('wp_ajax_dw_reorder_pages', 'dw_reorder_pages_callback');
add_action('wp_ajax_nopriv_dw_reorder_pages', 'dw_reorder_pages_callback'); // Allow non-logged-in users

function dw_reorder_pages_callback()
{
    check_ajax_referer('dw_reorder_pages_nonce', 'nonce');

    if (empty($_FILES['pdf_file']['name'])) {
        wp_send_json_error(array('message' => 'No PDF file selected for reordering.'));
    }
    if (empty($_POST['new_page_order'])) {
        wp_send_json_error(array('message' => 'No new page order specified.'));
    }

    $uploaded_file = $_FILES['pdf_file'];
    $new_order_string = sanitize_text_field($_POST['new_page_order']);

    $upload_dir = wp_upload_dir();
    $upload_path = $upload_dir['basedir'] . '/';

    $temp_input_pdf_path = ''; // For cleanup

    try {
        if ($uploaded_file['error'] === UPLOAD_ERR_OK && $uploaded_file['type'] === 'application/pdf') {
            $temp_input_pdf_name = uniqid('uploaded_reorder_') . '.pdf';
            $temp_input_pdf_path = $upload_path . $temp_input_pdf_name;

            if (!move_uploaded_file($uploaded_file['tmp_name'], $temp_input_pdf_path)) {
                throw new Exception('Failed to move uploaded file for reordering.');
            }
        } else {
            throw new Exception('File upload error or not a PDF.');
        }

        if (!file_exists($temp_input_pdf_path) || !is_readable($temp_input_pdf_path)) {
            throw new Exception('Cannot read the uploaded PDF file for reordering.');
        }

        // Initialize the FPDI object that will be used for creating the new PDF
        $reordered_pdf = new Fpdi();

        // Set the source file for this FPDI object.
        // This is crucial, as this object needs to read the input PDF to import pages.
        $original_page_count = $reordered_pdf->setSourceFile($temp_input_pdf_path);

        $new_order_array = array_map('intval', explode(',', $new_order_string));

        // Validate the new order
        $expected_pages = range(1, $original_page_count);
        $diff_to_expected = array_diff($expected_pages, $new_order_array);
        $diff_from_new = array_diff($new_order_array, $expected_pages);

        if (count($new_order_array) !== $original_page_count || !empty($diff_to_expected) || !empty($diff_from_new)) {
            throw new Exception('Invalid page order. Please provide all page numbers (1-' . $original_page_count . ') exactly once, separated by commas.');
        }

        // Check for duplicates in the new order
        if (count($new_order_array) !== count(array_unique($new_order_array))) {
            throw new Exception('Duplicate page numbers found in the new order. Each page must be listed only once.');
        }

        // Loop through the new order and import pages using the same $reordered_pdf object
        foreach ($new_order_array as $page_num) {
            if ($page_num < 1 || $page_num > $original_page_count) {
                // This should already be caught by the validation above, but as a double check
                throw new Exception('Invalid page number ' . $page_num . ' in the reorder list. Page numbers must be between 1 and ' . $original_page_count . '.');
            }
            $tplId = $reordered_pdf->importPage($page_num, '/MediaBox');
            $size = $reordered_pdf->getTemplateSize($tplId);
            $reordered_pdf->AddPage($size['orientation'], [$size['width'], $size['height']]);
            $reordered_pdf->useTemplate($tplId);
        }

        $reordered_filename = 'reordered_pdf_' . time() . '.pdf';
        $reordered_filepath = $upload_path . $reordered_filename;
        $reordered_file_url = $upload_dir['baseurl'] . '/' . $reordered_filename;

        $reordered_pdf->Output($reordered_filepath, 'F');

        if (!file_exists($reordered_filepath) || filesize($reordered_filepath) === 0) {
            throw new Exception('Reordered PDF file not created or is empty.');
        }

        // Clean up original uploaded file
        if (file_exists($temp_input_pdf_path)) {
            unlink($temp_input_pdf_path);
        }

        wp_send_json_success(array(
            'message' => 'PDF pages reordered successfully!',
            'download_url' => $reordered_file_url
        ));
    } catch (Exception $e) {
        // Clean up files on error
        if (file_exists($temp_input_pdf_path)) {
            unlink($temp_input_pdf_path);
        }
        wp_send_json_error(array('message' => 'Page reordering failed: ' . $e->getMessage()));
    }
}
