<?php
/*
Plugin Name: DocWiz - PDF Tools
Description: A simple PDF merge tool for demonstration purposes. (Dummy API Integration)
Version: 1.2
Author: Your Name
*/

// Prevent direct access to the file.
if ( ! defined( 'ABSPATH' ) ) {
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
function dw_enqueue_scripts() {
    // Correctly loading custom.js from the 'js' folder
    wp_enqueue_script( 'dw-custom-js', plugins_url( 'js/custom.js', __FILE__ ), array( 'jquery' ), '1.0', true );

    // Localize the script with AJAX URL and nonces for security
    wp_localize_script( 'dw-custom-js', 'dw_ajax', array(
        'ajaxurl'        => admin_url( 'admin-ajax.php' ),
        'merge_nonce'    => wp_create_nonce( 'dw_merge_nonce' ),
        'split_nonce'    => wp_create_nonce( 'dw_split_nonce' ),
        'compress_nonce' => wp_create_nonce( 'dw_compress_nonce' ),
        'rotate_nonce'   => wp_create_nonce( 'dw_rotate_nonce' ),
    'delete_pages_nonce' => wp_create_nonce( 'dw_delete_pages_nonce' ),
    'reorder_pages_nonce' => wp_create_nonce( 'dw_reorder_pages_nonce' ),
    'pdf_to_jpg_nonce' => wp_create_nonce( 'dw_pdf_to_jpg_nonce' ), // <-- Add this line
    'add_watermark_nonce' => wp_create_nonce( 'dw_add_watermark_nonce' ),
    'word_to_pdf_nonce' => wp_create_nonce( 'dw_word_to_pdf_nonce' ),
     'pdf_to_text_nonce' => wp_create_nonce( 'dw_pdf_to_text_nonce' ),
      'repair_pdf_nonce' => wp_create_nonce( 'dw_repair_pdf_nonce' ),
      'pdf_to_html_nonce' => wp_create_nonce( 'dw_pdf_to_html_nonce' ),
      'pdf_to_grayscale_nonce' => wp_create_nonce( 'dw_pdf_to_grayscale_nonce' ),
      'pdf_to_pdfa_nonce' => wp_create_nonce( 'dw_pdf_to_pdfa_nonce' ),
    ) );
}
add_action( 'wp_enqueue_scripts', 'dw_enqueue_scripts' );

/**
 * Enqueue Font Awesome for icons.
 */
function dw_enqueue_font_awesome() {
    wp_enqueue_style( 'font-awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css', array(), '6.5.2', 'all' );
}
add_action( 'wp_enqueue_scripts', 'dw_enqueue_font_awesome' );

/**
 * Shortcode to display the PDF merge form.
 */
function dw_merge_form_shortcode() {
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
add_shortcode( 'dw_merge_tool', 'dw_merge_form_shortcode' );

/**
 * Shortcode to display the PDF to HTML (via Images) conversion form.
 */
function dw_pdf_to_html_form_shortcode() {
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
add_shortcode( 'dw_pdf_to_html_tool', 'dw_pdf_to_html_form_shortcode' );
/**
 * Shortcode to display the PDF split form.
 */
function dw_split_form_shortcode() {
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
add_shortcode( 'dw_split_tool', 'dw_split_form_shortcode' );


/**
 * Shortcode to display the PDF compress form.
 */
function dw_compress_form_shortcode() {
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
add_shortcode( 'dw_compress_tool', 'dw_compress_form_shortcode' );

/**
 * Shortcode to display the PDF to JPG conversion form.
 */
function dw_pdf_to_jpg_form_shortcode() {
    ob_start();
    ?>
    <div id="pdf-to-jpg-app" style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,.1);">
        <h2>PDF to JPG</h2>
        <p>Upload a PDF file to convert each page into a separate JPG image.</p>
        <form id="pdf-to-jpg-form" enctype="multipart/form-data">
            <div style="margin-bottom: 15px;">
                <label for="pdf_to_jpg_file" style="display: block; font-weight: bold; margin-bottom: 5px;">Upload PDF File:</label>
                <input type="file" id="pdf_to_jpg_file" name="pdf_file" accept="application/pdf" required
                       style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
            </div>
            <button type="submit" style="background-color: #007bff; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer;">
                Convert to JPG
            </button>
        </form>
        <div id="pdf-to-jpg-status" style="margin-top: 15px; font-weight: bold;"></div>
        <div id="download-jpgs-container" style="margin-top: 15px; display: none;">
            </div>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode( 'dw_pdf_to_jpg_tool', 'dw_pdf_to_jpg_form_shortcode' );

/**
 * Shortcode to display the Add Watermark to PDF form.
 */
function dw_add_watermark_form_shortcode() {
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
add_shortcode( 'dw_add_watermark_tool', 'dw_add_watermark_form_shortcode' );

/**
 * Shortcode to display the PDF to Text conversion form.
 */
function dw_pdf_to_text_form_shortcode() {
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
add_shortcode( 'dw_pdf_to_text_tool', 'dw_pdf_to_text_form_shortcode' );
/**
 * Shortcode to display the PDF rotate form.
 */
function dw_rotate_form_shortcode() {
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
add_shortcode( 'dw_rotate_tool', 'dw_rotate_form_shortcode' );

/**
 * Shortcode to display the PDF delete pages form.
 */
function dw_delete_pages_form_shortcode() {
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
add_shortcode( 'dw_delete_pages_tool', 'dw_delete_pages_form_shortcode' );

/**
 * Shortcode to display the PDF reorder pages form.
 */
function dw_reorder_pages_form_shortcode() {
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
add_shortcode( 'dw_reorder_pages_tool', 'dw_reorder_pages_form_shortcode' );

// In free-pdf-buddy.php

/**
 * Shortcode to display the Word to PDF conversion form.
 */
function dw_word_to_pdf_form_shortcode() {
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
add_shortcode( 'dw_word_to_pdf_tool', 'dw_word_to_pdf_form_shortcode' );

/**
 * Shortcode to display the Repair PDF form.
 */
function dw_repair_pdf_form_shortcode() {
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
add_shortcode( 'dw_repair_pdf_tool', 'dw_repair_pdf_form_shortcode' );


/**
 * Shortcode to display the PDF to Grayscale conversion form.
 */
function dw_pdf_to_grayscale_form_shortcode() {
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
add_shortcode( 'dw_pdf_to_grayscale_tool', 'dw_pdf_to_grayscale_form_shortcode' );

/**
 * Shortcode to display the PDF to PDF/A conversion form.
 */
function dw_pdf_to_pdfa_form_shortcode() {
    ob_start();
    ?>
    <div id="pdf-to-pdfa-app" style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,.1);">
        <h2>PDF to PDF/A</h2>
        <p>Upload a PDF document to convert it to the PDF/A archival format (PDF/A-1b).</p>
        <form id="pdf-to-pdfa-form" enctype="multipart/form-data">
            <div style="margin-bottom: 15px;">
                <label for="pdf_file_pdfa" style="display: block; font-weight: bold; margin-bottom: 5px;">Upload PDF File:</label>
                <input type="file" id="pdf_file_pdfa" name="pdf_file" accept=".pdf" required
                       style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
            </div>
            <button type="submit" style="background-color: #007bff; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer;">
                Convert to PDF/A
            </button>
        </form>
        <div id="pdf-to-pdfa-status" style="margin-top: 15px; font-weight: bold;"></div>
        <div id="download-pdf-to-pdfa-container" style="margin-top: 15px; display: none;">
            <a id="download-pdf-to-pdfa" href="#" download style="background-color: #28a745; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">
                Download PDF/A
            </a>
        </div>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode( 'dw_pdf_to_pdfa_tool', 'dw_pdf_to_pdfa_form_shortcode' );


//----------------------------------------------------------------------
// AJAX Handlers for PDF Operations
//----------------------------------------------------------------------

/**
 * AJAX handler for PDF to PDF/A conversion.
 */
add_action('wp_ajax_dw_pdf_to_pdfa', 'dw_pdf_to_pdfa_callback');
add_action('wp_ajax_nopriv_dw_pdf_to_pdfa', 'dw_pdf_to_pdfa_callback');

function dw_pdf_to_pdfa_callback() {
    check_ajax_referer('dw_pdf_to_pdfa_nonce', 'nonce');

    if (empty($_FILES['pdf_file']['name'])) {
        wp_send_json_error(array('message' => 'No PDF file selected.'));
    }

    $uploaded_file = $_FILES['pdf_file'];
    $upload_dir = wp_upload_dir();
    $base_upload_path = rtrim(str_replace('\\', '/', $upload_dir['basedir']), '/');
    $base_upload_url = rtrim(str_replace('\\', '/', $upload_dir['baseurl']), '/');

    // Define Ghostscript executable path - USE FORWARD SLASHES CONSISTENTLY
    $gs_executable_path = 'C:/Program Files/gs/gs10.05.1/bin/gswin64c.exe'; 

    // Define the base Ghostscript installation path - USE FORWARD SLASHES CONSISTENTLY
    $gs_install_base_path = 'C:/Program Files/gs/gs10.05.1'; 
    
    // Define the path to the Ghostscript PDFA_def.ps file - USE FORWARD SLASHES CONSISTENTLY
    $pdfa_def_ps_path = $gs_install_base_path . '/lib/PDFA_def.ps'; 

    // Define the path to Ghostscript's ICCProfiles directory - USE FORWARD SLASHES CONSISTENTLY
    $icc_profiles_dir_path = $gs_install_base_path . '/iccprofiles'; 

    $temp_input_pdf_path = '';
    $temp_output_dir = $base_upload_path . '/temp_conversions/'; 
    $output_pdfa_path = '';

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

        // Construct the --permit-file-read arguments.
        // Use consistent forward slashes for all paths passed to escapeshellarg.
        $permit_reads = '';
        $permit_reads .= ' --permit-file-read=' . escapeshellarg($gs_install_base_path . '/lib');
        $permit_reads .= ' --permit-file-read=' . escapeshellarg($icc_profiles_dir_path); // Corrected path
        $permit_reads .= ' --permit-file-read=' . escapeshellarg($gs_install_base_path . '/Resource');
        $permit_reads .= ' --permit-file-read=' . escapeshellarg($gs_install_base_path . '/bin');


        // Ghostscript command for PDF to PDF/A conversion
        // IMPORTANT: escapeshellarg() around EVERY path argument
        $gs_command = escapeshellarg($gs_executable_path) . ' -dPDFA -dBATCH -dNOPAUSE -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -sProcessColorModel=DeviceCMYK -sColorConversionStrategy=CMYK' . $permit_reads . ' -sOutputFile=' . escapeshellarg($temp_output_dir . uniqid('pdfa_') . '.pdf') . ' ' . escapeshellarg($temp_input_pdf_path) . ' ' . escapeshellarg($pdfa_def_ps_path) . ' 2>&1';
        
        $output = null;
        $return_var = null;
        exec($gs_command, $output, $return_var);

        error_log('PDF to PDF/A Ghostscript Command: ' . $gs_command);
        error_log('PDF to PDF/A Ghostscript Return Var: ' . $return_var);
        error_log('PDF to PDF/A Ghostscript Output: ' . implode("\n", $output));

        // Check for both non-zero return code and specific error messages in output
        $error_output_string = implode("\n", $output);
        if ($return_var !== 0 || strpos($error_output_string, 'PDF/A processing aborted') !== false || strpos($error_output_string, 'Failed to open the supplied ICCProfile') !== false) {
            throw new Exception('PDF to PDF/A conversion failed: Ghostscript reported issues. Output: ' . $error_output_string);
        }

        // Find the generated PDF/A file
        // Re-extract the output filename more robustly
        preg_match('/-sOutputFile=("[^"]+"|\S+)/', $gs_command, $matches);
        $output_filename_quoted = $matches[1] ?? '';
        $output_pdfa_path = str_replace(['"', "'"], '', $output_filename_quoted); // Remove quotes

        if (!file_exists($output_pdfa_path) || filesize($output_pdfa_path) === 0) {
            throw new Exception('Converted PDF/A file was not found or is empty. Please check server logs for Ghostscript output details.');
        }

        $download_url = $base_upload_url . '/temp_conversions/' . basename($output_pdfa_path);

        wp_send_json_success(array(
            'message' => 'PDF converted to PDF/A successfully!',
            'download_url' => $download_url
        ));

    } catch (Exception $e) {
        // Clean up files on error
        if (file_exists($temp_input_pdf_path)) {
            unlink($temp_input_pdf_path);
        }
        // Ensure output_pdfa_path is defined before attempting to unlink
        if (isset($output_pdfa_path) && file_exists($output_pdfa_path)) {
            unlink($output_pdfa_path);
        }
        wp_send_json_error(array('message' => 'Conversion failed: ' . $e->getMessage()));
    } finally {
        if (file_exists($temp_input_pdf_path)) {
            unlink($temp_input_pdf_path);
        }
    }
}
/**
 * AJAX handler for PDF to Grayscale conversion.
 */
add_action('wp_ajax_dw_pdf_to_grayscale', 'dw_pdf_to_grayscale_callback');
add_action('wp_ajax_nopriv_dw_pdf_to_grayscale', 'dw_pdf_to_grayscale_callback');

function dw_pdf_to_grayscale_callback() {
    check_ajax_referer('dw_pdf_to_grayscale_nonce', 'nonce');

    if (empty($_FILES['pdf_file']['name'])) {
        wp_send_json_error(array('message' => 'No PDF file selected.'));
    }

    $uploaded_file = $_FILES['pdf_file'];
    $upload_dir = wp_upload_dir();
    $base_upload_path = rtrim(str_replace('\\', '/', $upload_dir['basedir']), '/');

    $gs_executable_path = '"C:\Program Files\gs\gs10.05.1\bin\gswin64c.exe"'; 

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

function dw_pdf_to_html_callback() {
    check_ajax_referer('dw_pdf_to_html_nonce', 'nonce');

    if (empty($_FILES['pdf_file']['name'])) {
        wp_send_json_error(array('message' => 'No PDF file selected.'));
    }

    $uploaded_file = $_FILES['pdf_file'];
    $upload_dir = wp_upload_dir();
    $upload_path = $upload_dir['basedir'] . '/';

    // Define Ghostscript executable path (adjust as per your installation)
    $gs_executable_path = '"C:\Program Files\gs\gs10.05.1\bin\gswin64c.exe"'; 

    $temp_input_pdf_path = '';
    $temp_output_dir = $upload_path . 'temp_conversions/'; 
    $generated_images = []; // To store paths of generated images

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

        // --- Step 1: Convert PDF pages to JPG images ---
        // Output image file pattern (Ghostscript will add page numbers)
        $output_img_pattern = $temp_output_dir . uniqid('pdf_page_') . '_%d.jpg'; // %d is for page number

        // Ghostscript command for PDF to JPG conversion
        // -sDEVICE=jpeg: JPEG output
        // -r300: Resolution (300 DPI is good quality)
        // -o: Output file pattern
        $gs_command_images = $gs_executable_path . ' -dNOPAUSE -dBATCH -sDEVICE=jpeg -r300 -o ' . escapeshellarg($output_img_pattern) . ' ' . escapeshellarg($temp_input_pdf_path) . ' 2>&1';

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
        $image_base_name = str_replace(['%d.jpg', '%d.png'], '', basename($output_img_pattern)); // Remove page pattern and extension
        $all_files_in_dir = scandir($temp_output_dir);
        
        $image_urls = [];
        foreach ($all_files_in_dir as $file) {
            // Check if file starts with the unique ID and ends with .jpg
            if (strpos($file, $image_base_name) === 0 && strtolower(pathinfo($file, PATHINFO_EXTENSION)) === 'jpg') {
                $generated_images[] = $temp_output_dir . $file; // Store full path for cleanup
                $image_urls[] = $upload_dir['baseurl'] . '/temp_conversions/' . $file; // Store URL for HTML
            }
        }
        
        // Sort images by page number to ensure correct order
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

        $download_url = $upload_dir['baseurl'] . '/temp_conversions/' . basename($output_html_path);

        wp_send_json_success(array(
            'message' => 'PDF converted to HTML successfully!',
            'download_url' => $download_url
        ));

    } catch (Exception $e) {
        // Clean up files on error
        if (file_exists($temp_input_pdf_path)) {
            unlink($temp_input_pdf_path);
        }
        foreach ($generated_images as $img_path) {
            if (file_exists($img_path)) {
                unlink($img_path);
            }
        }
        if (isset($output_html_path) && file_exists($output_html_path)) {
            unlink($output_html_path);
        }
        wp_send_json_error(array('message' => 'Conversion failed: ' . $e->getMessage()));
    }
}

/**
 * AJAX handler for Repair PDF.
 */
add_action('wp_ajax_dw_repair_pdf', 'dw_repair_pdf_callback');
add_action('wp_ajax_nopriv_dw_repair_pdf', 'dw_repair_pdf_callback');

function dw_repair_pdf_callback() {
    check_ajax_referer('dw_repair_pdf_nonce', 'nonce');

    if (empty($_FILES['pdf_file']['name'])) {
        wp_send_json_error(array('message' => 'No PDF file selected.'));
    }

    $uploaded_file = $_FILES['pdf_file'];
    $upload_dir = wp_upload_dir();
    $upload_path = $upload_dir['basedir'] . '/';

    // Define Ghostscript executable path (adjust as per your installation)
    // Use the double-quoting fix for paths with spaces!
    $gs_executable_path = '"C:\Program Files\gs\gs10.05.1\bin\gswin64c.exe"'; 
    // On Linux, it might just be 'gs' or '/usr/bin/gs' and likely doesn't need outer quotes

    $temp_input_pdf_path = '';
    $temp_output_dir = $upload_path . 'temp_conversions/'; 

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

        // Define output repaired PDF file path
        $output_repaired_pdf_name = uniqid('repaired_pdf_') . '.pdf';
        $output_repaired_pdf_path = $temp_output_dir . $output_repaired_pdf_name;

        // Ghostscript command to "repair" a PDF by re-rendering it
        // -sDEVICE=pdfwrite: output a new PDF
        // -dCompatibilityLevel=1.4: ensures a common PDF version
        // -dNOPAUSE -dBATCH: standard Ghostscript options for non-interactive mode
        // -sOutputFile: specifies the output file
        $gs_command = $gs_executable_path . ' -dNOPAUSE -dBATCH -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -sOutputFile=' . escapeshellarg($output_repaired_pdf_path) . ' ' . escapeshellarg($temp_input_pdf_path) . ' 2>&1';

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

        // Clean up original uploaded PDF
        if (file_exists($temp_input_pdf_path)) {
            unlink($temp_input_pdf_path);
        }

        $download_url = $upload_dir['baseurl'] . '/temp_conversions/' . basename($output_repaired_pdf_path);

        wp_send_json_success(array(
            'message' => 'PDF repaired successfully!',
            'download_url' => $download_url
        ));

    } catch (Exception $e) {
        // Clean up files on error
        if (file_exists($temp_input_pdf_path)) {
            unlink($temp_input_pdf_path);
        }
        if (isset($output_repaired_pdf_path) && file_exists($output_repaired_pdf_path)) {
            unlink($output_repaired_pdf_path);
        }
        wp_send_json_error(array('message' => 'Repair failed: ' . $e->getMessage()));
    }
}

/**
 * AJAX handler for converting Word to PDF using LibreOffice (conceptual).
 */
add_action('wp_ajax_dw_word_to_pdf', 'dw_word_to_pdf_callback');
add_action('wp_ajax_nopriv_dw_word_to_pdf', 'dw_word_to_pdf_callback');

function dw_word_to_pdf_callback() {
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

function dw_merge_pdfs_callback() {
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

function dw_split_pdfs_callback() {
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

function dw_pdf_to_text_callback() {
    check_ajax_referer('dw_pdf_to_text_nonce', 'nonce');

    if (empty($_FILES['pdf_file']['name'])) {
        wp_send_json_error(array('message' => 'No PDF file selected.'));
    }

    $uploaded_file = $_FILES['pdf_file'];
    $upload_dir = wp_upload_dir();
    $upload_path = $upload_dir['basedir'] . '/';

    // Define Ghostscript executable path (adjust as per your installation)
    // Make sure to use the correct path to your Ghostscript executable (gs.exe)
    // Example for Windows (adjust if your path is different):
    $gs_executable_path = '"C:\Program Files\gs\gs10.05.1\bin\gswin64c.exe"'; 
    // If you're on Linux, it might just be 'gs' or '/usr/bin/gs'

    $temp_input_pdf_path = '';
    $temp_output_dir = $upload_path . 'temp_conversions/'; 

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

        // Define output .txt file path
        $output_text_name = uniqid('converted_pdf_') . '.txt';
        $output_text_path = $temp_output_dir . $output_text_name;

        // Ghostscript command for PDF to Text conversion
        // -sDEVICE=txtwrite: Specifies the text output device
        // -o: Output file
        $gs_command = $gs_executable_path . ' -dBATCH -dNOPAUSE -sDEVICE=txtwrite -o ' . escapeshellarg($output_text_path) . ' ' . escapeshellarg($temp_input_pdf_path) . ' 2>&1';

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

        // Clean up original uploaded PDF
        if (file_exists($temp_input_pdf_path)) {
            unlink($temp_input_pdf_path);
        }

        $download_url = $upload_dir['baseurl'] . '/temp_conversions/' . basename($output_text_path);

        wp_send_json_success(array(
            'message' => 'PDF converted to Text successfully!',
            'download_url' => $download_url
        ));

    } catch (Exception $e) {
        // Clean up files on error
        if (file_exists($temp_input_pdf_path)) {
            unlink($temp_input_pdf_path);
        }
        if (isset($output_text_path) && file_exists($output_text_path)) {
            unlink($output_text_path);
        }
        wp_send_json_error(array('message' => 'Conversion failed: ' . $e->getMessage()));
    }
}
/**
 * AJAX handler for compressing PDFs using Ghostscript.
 */
add_action('wp_ajax_dw_compress_pdfs', 'dw_compress_pdfs_callback');
add_action('wp_ajax_nopriv_dw_compress_pdfs', 'dw_compress_pdfs_callback'); // Allow non-logged-in users

function dw_compress_pdfs_callback() {
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

        // Ghostscript command:
        // IMPORTANT: The path to 'gswin64c' (or 'gs' on Linux/macOS) might need to be absolute if not in your system's PATH.
        // E.g., '"C:\Program Files\gs\gs9.56.1\bin\gswin64c.exe"'
        // Ensure you use double quotes around paths, especially if they contain spaces.
        // Use escapeshellarg() for all dynamic parts of the command to prevent shell injection.
        // You MUST replace 'gswin64c' with the full absolute path to your Ghostscript executable if it's not in your system's PATH.
        // Example for Windows (adjust version if different): $gs_executable_path = '"C:\Program Files\gs\gs9.56.1\bin\gswin64c.exe"';
        // Example for Linux/macOS: $gs_executable_path = '/usr/bin/gs'; or `which gs` to find the path.
        $gs_executable_path = 'gswin64c'; // Default: assumes gswin64c is in your system's PATH

        // Try to locate Ghostscript if the default fails (Windows specific example)
        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            $possible_gs_paths = [
                'C:\Program Files\gs\gs10.05.1\bin\gswin64c.exe', // Common path for 64-bit
                'C:\Program Files (x86)\gs\gs9.56.1\bin\gswin32c.exe', // Common path for 32-bit
                // You might need to adjust the version number (e.g., gs9.56.1)
                // Add other common paths or specific paths based on your installation
            ];
            foreach ($possible_gs_paths as $path) {
                if (file_exists($path)) {
                    $gs_executable_path = '"' . $path . '"'; // Add quotes for paths with spaces
                    break;
                }
            }
        } else { // Linux/macOS
            $gs_executable_path = 'gs'; // Default for Linux/macOS, usually in PATH
            // You can try to find it dynamically if 'gs' doesn't work
            // $gs_path_output = shell_exec('which gs');
            // if (!empty($gs_path_output)) {
            //     $gs_executable_path = trim($gs_path_output);
            // }
        }

        if ($gs_executable_path === 'gswin64c' && strtoupper(substr(PHP_OS, 0, 3)) === 'WIN' && !file_exists(str_replace('"', '', $gs_executable_path))) {
             // If we're still using the default and it's Windows, and the file doesn't exist (implying not in PATH)
             throw new Exception('Ghostscript executable (gswin64c) not found. Please specify the full path in free-pdf-buddy.php or add it to your system\'s PATH.');
        }


        $gs_command = $gs_executable_path . ' -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -sOutputFile=' . escapeshellarg($compressed_filepath) . ' ' . escapeshellarg($temp_input_pdf_path) . ' 2>&1';

        $output = null;
        $return_var = null;
        exec($gs_command, $output, $return_var);

        if ($return_var !== 0) {
            // Ghostscript command failed
            throw new Exception('Ghostscript compression failed. Return code: ' . $return_var . '. Output: ' . implode("\n", $output));
        }

        if (!file_exists($compressed_filepath) || filesize($compressed_filepath) === 0) {
            throw new Exception('Compressed PDF file not created or is empty. Check Ghostscript installation/path.');
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
        wp_send_json_error(array('message' => 'Compression failed: ' . $e->getMessage()));
    }
}

/**
 * AJAX handler for converting PDF to JPG using Ghostscript.
 */
add_action('wp_ajax_dw_pdf_to_jpg', 'dw_pdf_to_jpg_callback');
add_action('wp_ajax_nopriv_dw_pdf_to_jpg', 'dw_pdf_to_jpg_callback'); // Allow non-logged-in users

function dw_pdf_to_jpg_callback() {
    error_log('[dw_pdf_to_jpg_callback] Function started.');

    check_ajax_referer('dw_pdf_to_jpg_nonce', 'nonce');

    if (empty($_FILES['pdf_file']['name'])) {
        error_log('[dw_pdf_to_jpg_callback] Error: No PDF file selected.');
        wp_send_json_error(array('message' => 'No PDF file selected for conversion to JPG.'));
    }

    $uploaded_file = $_FILES['pdf_file'];
    $upload_dir = wp_upload_dir();
    $upload_path = $upload_dir['basedir'] . '/';
    $upload_url = $upload_dir['baseurl'] . '/';

    error_log('[dw_pdf_to_jpg_callback] Upload path: ' . $upload_path);

    $temp_input_pdf_path = ''; // For cleanup
    $output_jpg_paths = []; // To store paths of generated JPGs for cleanup

    try {
        if ($uploaded_file['error'] === UPLOAD_ERR_OK && $uploaded_file['type'] === 'application/pdf') {
            $temp_input_pdf_name = uniqid('uploaded_pdf2jpg_') . '.pdf';
            $temp_input_pdf_path = $upload_path . $temp_input_pdf_name;
            error_log('[dw_pdf_to_jpg_callback] Attempting to move uploaded file from ' . $uploaded_file['tmp_name'] . ' to ' . $temp_input_pdf_path);

            if (!move_uploaded_file($uploaded_file['tmp_name'], $temp_input_pdf_path)) {
                error_log('[dw_pdf_to_jpg_callback] Error: Failed to move uploaded file. Check permissions on ' . $upload_path);
                throw new Exception('Failed to move uploaded PDF file for conversion.');
            }
            error_log('[dw_pdf_to_jpg_callback] Uploaded file moved successfully.');
        } else {
            error_log('[dw_pdf_to_jpg_callback] Error: File upload error (' . $uploaded_file['error'] . ') or not a PDF (' . $uploaded_file['type'] . ').');
            throw new Exception('File upload error or not a PDF.');
        }

        if (!file_exists($temp_input_pdf_path) || !is_readable($temp_input_pdf_path)) {
            error_log('[dw_pdf_to_jpg_callback] Error: Cannot read uploaded PDF file. Exists: ' . (file_exists($temp_input_pdf_path) ? 'true' : 'false') . ', Readable: ' . (is_readable($temp_input_pdf_path) ? 'true' : 'false') . ' Path: ' . $temp_input_pdf_path);
            throw new Exception('Cannot read the uploaded PDF file for conversion.');
        }
        error_log('[dw_pdf_to_jpg_callback] Uploaded PDF file is readable: ' . $temp_input_pdf_path);

        // Determine Ghostscript executable path
        $gs_executable_path = 'gswin64c'; // Default: assumes gswin64c is in your system's PATH
        $found_gs_path = false;
        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            $possible_gs_paths = [
                'C:\Program Files\gs\gs10.05.1\bin\gswin64c.exe',
                'C:\Program Files (x86)\gs\gs9.56.1\bin\gswin32c.exe',
                'C:\Program Files\gs\gs10.00\bin\gswin64c.exe',
                'C:\Program Files\gs\gs9.56.1\bin\gswin64c.exe'
            ];
            foreach ($possible_gs_paths as $path) {
                if (file_exists($path)) {
                    $gs_executable_path = '"' . $path . '"';
                    $found_gs_path = true;
                    error_log('[dw_pdf_to_jpg_callback] Found Ghostscript executable at: ' . $gs_executable_path);
                    break;
                }
            }
        } else {
            $gs_executable_path = 'gs';
            exec('which gs 2>&1', $which_output, $which_return);
            if ($which_return === 0) {
                 error_log('[dw_pdf_to_jpg_callback] Ghostscript (gs) found in PATH: ' . implode('', $which_output));
                 $found_gs_path = true;
            } else {
                 error_log('[dw_pdf_to_jpg_callback] Ghostscript (gs) not found in PATH on non-Windows system.');
            }
        }

        if (!$found_gs_path) {
             throw new Exception('Ghostscript executable not found. Please ensure it\'s installed and its path is correctly configured in the plugin, or added to your system\'s PATH.');
        }

        // Define output base name for JPGs
        $output_base_name = 'pdf2jpg_' . time();
        
        // CRITICAL: Ensure no accidental spaces and use consistent forward slashes for Ghostscript path
        // trim() is added to remove any leading/trailing whitespace that might exist from $upload_path.
        $cleaned_upload_path = trim(str_replace('\\', '/', untrailingslashit($upload_path)));
        
        // This is the exact pattern Ghostscript will use. ENSURE NO SPACE between '_' and '%d'.
        $output_jpg_path_pattern_for_gs = $cleaned_upload_path . '/' . $output_base_name . '_%d.jpg';
        
        // This is the path pattern we will use to *check* for files in PHP.
        $output_jpg_path_pattern_for_php = untrailingslashit($upload_path) . '/' . $output_base_name . '_%d.jpg';

        // Ghostscript command for PDF to JPG conversion
        $gs_command = $gs_executable_path . ' -dBATCH -dNOPAUSE -sDEVICE=jpeg -r300 -dUseCIEColor -dTextAlphaBits=4 -dGraphicsAlphaBits=4 -sOutputFile=' . escapeshellarg($output_jpg_path_pattern_for_gs) . ' ' . escapeshellarg($temp_input_pdf_path) . ' 2>&1';

        error_log('[dw_pdf_to_jpg_callback] Executing Ghostscript command: ' . $gs_command);

        $output = null;
        $return_var = null;
        exec($gs_command, $output, $return_var);

        error_log('[dw_pdf_to_jpg_callback] Ghostscript command finished. Return var: ' . $return_var);
        error_log('[dw_pdf_to_jpg_callback] Ghostscript output: ' . implode("\n", $output));


        if ($return_var !== 0) {
            throw new Exception('PDF to JPG conversion failed. Ghostscript returned an error code: ' . $return_var . '. Output: ' . implode("\n", $output));
        }

        // Now, collect the generated JPG files
        $jpg_files_data = [];
        $page_num = 1;
        while (true) {
            // Use the PHP-friendly path pattern to check for files
            $current_jpg_path = str_replace('%d', $page_num, $output_jpg_path_pattern_for_php);
            
            // Check if the file exists AND has content
            if (file_exists($current_jpg_path) && filesize($current_jpg_path) > 0) {
                error_log('[dw_pdf_to_jpg_callback] Found generated JPG: ' . $current_jpg_path);
                $output_jpg_paths[] = $current_jpg_path; // Add to cleanup list
                $jpg_files_data[] = [
                    'page_number' => $page_num,
                    'download_url' => $upload_url . basename($current_jpg_path)
                ];
                $page_num++;
            } else {
                error_log('[dw_pdf_to_jpg_callback] No more JPGs found or file empty at: ' . $current_jpg_path);
                break; // No more pages or file is empty
            }
            if ($page_num > 1000) { 
                error_log('[dw_pdf_to_jpg_callback] Exceeded max page check (1000). Breaking loop.');
                break;
            }
        }

        if (empty($jpg_files_data)) {
            error_log('[dw_pdf_to_jpg_callback] Error: No JPG files were found after Ghostscript execution. This indicates a problem with Ghostscript\'s output, even if it returned 0. Review the Ghostscript output above.');
            throw new Exception('No JPG files were generated. Check PDF content or Ghostscript configuration. See debug log for Ghostscript output for more details.');
        }

        // Clean up original uploaded file
        if (file_exists($temp_input_pdf_path)) {
            unlink($temp_input_pdf_path);
            error_log('[dw_pdf_to_jpg_callback] Cleaned up original PDF: ' . $temp_input_pdf_path);
        }

        wp_send_json_success(array(
            'message' => 'PDF converted to JPGs successfully! Generated ' . count($jpg_files_data) . ' images.',
            'split_files' => $jpg_files_data
        ));

    } catch (Exception $e) {
        error_log('[dw_pdf_to_jpg_callback] Caught exception: ' . $e->getMessage());
        if (file_exists($temp_input_pdf_path)) {
            unlink($temp_input_pdf_path);
            error_log('[dw_pdf_to_jpg_callback] Cleaned up original PDF on error: ' . $temp_input_pdf_path);
        }
        foreach ($output_jpg_paths as $path) {
            if (file_exists($path)) {
                unlink($path);
                error_log('[dw_pdf_to_jpg_callback] Cleaned up generated JPG on error: ' . $path);
            }
        }
        wp_send_json_error(array('message' => 'PDF to JPG conversion failed: ' . $e->getMessage()));
    }
}
/**
 * AJAX handler for adding a text watermark to a PDF.
 */
add_action('wp_ajax_dw_add_watermark', 'dw_add_watermark_callback');
add_action('wp_ajax_nopriv_dw_add_watermark', 'dw_add_watermark_callback'); // Allow non-logged-in users

function dw_add_watermark_callback() {
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
 * AJAX handler for rotating PDFs using FPDI.
 */
add_action('wp_ajax_dw_rotate_pdfs', 'dw_rotate_pdfs_callback');
add_action('wp_ajax_nopriv_dw_rotate_pdfs', 'dw_rotate_pdfs_callback'); // Allow non-logged-in users

function dw_rotate_pdfs_callback() {
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
function dw_parse_page_ranges($range_string, $total_pages) {
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

function dw_delete_pages_callback() {
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

function dw_reorder_pages_callback() {
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