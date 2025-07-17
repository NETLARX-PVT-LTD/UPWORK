jQuery(document).ready(function($) {

    // --- Merge PDFs Form Handler ---
    $('#pdf-merge-form').on('submit', function(e) {
        e.preventDefault();

        var formData = new FormData(this);
        formData.append('action', 'dw_merge_pdfs'); // WordPress AJAX action
        formData.append('nonce', dw_ajax.merge_nonce); // Security nonce

        $('#merge-status').text('Processing... Please wait, this may take a moment.').css('color', 'blue');
        $('#download-merged-pdf-container').hide(); // Hide previous download link

        $.ajax({
            url: dw_ajax.ajaxurl,
            type: 'POST',
            data: formData,
            contentType: false, // Important for file uploads
            processData: false, // Important for file uploads
            success: function(response) {
                if (response.success) {
                    $('#merge-status').text(response.data.message).css('color', 'green');
                    $('#download-merged-pdf').attr('href', response.data.download_url);
                    $('#download-merged-pdf-container').show(); // Show the download button
                } else {
                    $('#merge-status').text('Error: ' + response.data.message).css('color', 'red');
                    $('#download-merged-pdf-container').hide();
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                $('#merge-status').text('An AJAX error occurred: ' + textStatus).css('color', 'red');
                console.error("AJAX Error:", textStatus, errorThrown, jqXHR.responseText);
            }
        });
    });

    // --- Split PDFs Form Handler ---
    $('#pdf-split-form').on('submit', function(e) {
        e.preventDefault();

        var formData = new FormData(this);
        formData.append('action', 'dw_split_pdfs');
        formData.append('nonce', dw_ajax.split_nonce);

        $('#split-status').text('Processing... Please wait, this may take a moment.').css('color', 'blue');
        $('#download-split-pdfs-container').empty().hide(); // Clear and hide previous links

        $.ajax({
            url: dw_ajax.ajaxurl,
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: function(response) {
                if (response.success) {
                    $('#split-status').text(response.data.message).css('color', 'green');
                    var $container = $('#download-split-pdfs-container');
                    $container.empty(); // Clear any previous links

                    if (response.data.split_files && response.data.split_files.length > 0) {
                        $.each(response.data.split_files, function(index, file) {
                            $container.append('<p><a href="' + file.download_url + '" download style="background-color: #28a745; color: white; padding: 8px 12px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 5px;">Download Page ' + file.page_number + '</a></p>');
                        });
                        $container.show();
                    } else {
                        $('#split-status').text('Splitting completed, but no files to download.').css('color', 'orange');
                    }

                } else {
                    $('#split-status').text('Error: ' + response.data.message).css('color', 'red');
                    $('#download-split-pdfs-container').hide();
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                $('#split-status').text('An AJAX error occurred: ' + textStatus).css('color', 'red');
                console.error("AJAX Error:", textStatus, errorThrown, jqXHR.responseText);
            }
        });
    });

    // --- Compress PDFs Form Handler ---
    $('#pdf-compress-form').on('submit', function(e) {
        e.preventDefault();

        var formData = new FormData(this);
        formData.append('action', 'dw_compress_pdfs');
        formData.append('nonce', dw_ajax.compress_nonce);

        $('#compress-status').text('Processing... Please wait, this may take a moment.').css('color', 'blue');
        $('#download-compressed-pdf-container').hide();

        $.ajax({
            url: dw_ajax.ajaxurl,
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: function(response) {
                if (response.success) {
                    $('#compress-status').text(response.data.message).css('color', 'green');
                    $('#download-compressed-pdf').attr('href', response.data.download_url);
                    $('#download-compressed-pdf-container').show();
                } else {
                    $('#compress-status').text('Error: ' + response.data.message).css('color', 'red');
                    $('#download-compressed-pdf-container').hide();
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                $('#compress-status').text('An AJAX error occurred: ' + textStatus).css('color', 'red');
                console.error("AJAX Error:", textStatus, errorThrown, jqXHR.responseText);
            }
        });
    });

   // Add this to your custom.js file

// --- PDF to JPG Form Handler ---
$('#pdf-to-jpg-form').on('submit', function(e) {
    e.preventDefault();

    var formData = new FormData(this);
    formData.append('action', 'dw_pdf_to_jpg');
    // You'll need to add your nonce here, e.g., formData.append('nonce', dw_ajax.pdf_to_jpg_nonce);

    $('#pdf-to-jpg-status').text('Processing... Converting PDF to JPGs. This may take a moment.').css('color', 'blue');
    $('#download-jpg-container').hide();
    $('#jpg-download-links').empty(); // Clear previous links

    $.ajax({
        url: dw_ajax.ajaxurl,
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        success: function(response) {
            if (response.success) {
                $('#pdf-to-jpg-status').text(response.data.message).css('color', 'green');
                if (response.data.download_urls && response.data.download_urls.length > 0) {
                    var downloadLinksHtml = '';
                    $.each(response.data.download_urls, function(index, url) {
                        var filename = url.substring(url.lastIndexOf('/') + 1);
                        downloadLinksHtml += '<a href="' + url + '" download="' + filename + '" style="background-color: #28a745; color: white; padding: 8px 12px; text-decoration: none; border-radius: 4px; margin-right: 10px; margin-bottom: 10px; display: inline-block;">Download ' + filename + '</a>';
                    });
                    $('#jpg-download-links').html(downloadLinksHtml);
                    $('#download-jpg-container').show();
                } else {
                    $('#pdf-to-jpg-status').text('Error: No JPG files returned.').css('color', 'red');
                }
            } else {
                $('#pdf-to-jpg-status').text('Error: ' + response.data.message).css('color', 'red');
                $('#download-jpg-container').hide();
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            $('#pdf-to-jpg-status').text('An AJAX error occurred: ' + textStatus).css('color', 'red');
            console.error("AJAX Error:", textStatus, errorThrown, jqXHR.responseText);
        }
    });
});

// custom.js (add this section)

// --- Add Page Numbers Form Handler ---
$('#add-page-numbers-form').on('submit', function(e) {
    e.preventDefault();

    var formData = new FormData(this);
    formData.append('action', 'dw_add_page_numbers');
    // IMPORTANT: Add your nonce here for security
    // formData.append('nonce', dw_ajax.add_page_numbers_nonce);

    $('#add-page-numbers-status').text('Processing... Adding page numbers.').css('color', 'blue');
    $('#download-page-numbered-pdf-container').hide();

    $.ajax({
        url: dw_ajax.ajaxurl,
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        success: function(response) {
            if (response.success) {
                $('#add-page-numbers-status').text(response.data.message).css('color', 'green');
                $('#download-page-numbered-pdf').attr('href', response.data.download_url);
                $('#download-page-numbered-pdf-container').show();
            } else {
                $('#add-page-numbers-status').text('Error: ' + response.data.message).css('color', 'red');
                $('#download-page-numbered-pdf-container').hide();
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            $('#add-page-numbers-status').text('An AJAX error occurred: ' + textStatus).css('color', 'red');
            console.error("AJAX Error:", textStatus, errorThrown, jqXHR.responseText);
        }
    });
});

// --- Add Watermark Form Handler ---
$('#pdf-add-watermark-form').on('submit', function(e) {
    e.preventDefault();

    var formData = new FormData(this);
    formData.append('action', 'dw_add_watermark');
    formData.append('nonce', dw_ajax.add_watermark_nonce);

    $('#add-watermark-status').text('Processing... Please wait, this may take a moment.').css('color', 'blue');
    $('#download-watermarked-pdf-container').hide();

    $.ajax({
        url: dw_ajax.ajaxurl,
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        success: function(response) {
            if (response.success) {
                $('#add-watermark-status').text(response.data.message).css('color', 'green');
                $('#download-watermarked-pdf').attr('href', response.data.download_url);
                $('#download-watermarked-pdf-container').show();
            } else {
                $('#add-watermark-status').text('Error: ' + response.data.message).css('color', 'red');
                $('#download-watermarked-pdf-container').hide();
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            $('#add-watermark-status').text('An AJAX error occurred: ' + textStatus).css('color', 'red');
            console.error("AJAX Error:", textStatus, errorThrown, jqXHR.responseText);
        }
    });
});

// --- Delete Pages Form Handler ---
$('#pdf-delete-pages-form').on('submit', function(e) {
    e.preventDefault();

    var formData = new FormData(this);
    formData.append('action', 'dw_delete_pages');
    formData.append('nonce', dw_ajax.delete_pages_nonce);

    $('#delete-pages-status').text('Processing... Please wait, this may take a moment.').css('color', 'blue');
    $('#download-modified-pdf-container').hide();

    $.ajax({
        url: dw_ajax.ajaxurl,
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        success: function(response) {
            if (response.success) {
                $('#delete-pages-status').text(response.data.message).css('color', 'green');
                $('#download-modified-pdf').attr('href', response.data.download_url);
                $('#download-modified-pdf-container').show();
            } else {
                $('#delete-pages-status').text('Error: ' + response.data.message).css('color', 'red');
                $('#download-modified-pdf-container').hide();
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            $('#delete-pages-status').text('An AJAX error occurred: ' + textStatus).css('color', 'red');
            console.error("AJAX Error:", textStatus, errorThrown, jqXHR.responseText);
        }
    });
});

// --- Rotate PDFs Form Handler ---
$('#pdf-rotate-form').on('submit', function(e) {
    e.preventDefault();

    var formData = new FormData(this);
    formData.append('action', 'dw_rotate_pdfs');
    formData.append('nonce', dw_ajax.rotate_nonce);

    $('#rotate-status').text('Processing... Please wait, this may take a moment.').css('color', 'blue');
    $('#download-rotated-pdf-container').hide();

    $.ajax({
        url: dw_ajax.ajaxurl,
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        success: function(response) {
            if (response.success) {
                $('#rotate-status').text(response.data.message).css('color', 'green');
                $('#download-rotated-pdf').attr('href', response.data.download_url);
                $('#download-rotated-pdf-container').show();
            } else {
                $('#rotate-status').text('Error: ' + response.data.message).css('color', 'red');
                $('#download-rotated-pdf-container').hide();
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            $('#rotate-status').text('An AJAX error occurred: ' + textStatus).css('color', 'red');
            console.error("AJAX Error:", textStatus, errorThrown, jqXHR.responseText);
        }
    });
});


// --- Reorder Pages Form Handler ---
$('#pdf-reorder-pages-form').on('submit', function(e) {
    e.preventDefault();

    var formData = new FormData(this);
    formData.append('action', 'dw_reorder_pages');
    formData.append('nonce', dw_ajax.reorder_pages_nonce);

    $('#reorder-pages-status').text('Processing... Please wait, this may take a moment.').css('color', 'blue');
    $('#download-reordered-pdf-container').hide();

    $.ajax({
        url: dw_ajax.ajaxurl,
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        success: function(response) {
            if (response.success) {
                $('#reorder-pages-status').text(response.data.message).css('color', 'green');
                $('#download-reordered-pdf').attr('href', response.data.download_url);
                $('#download-reordered-pdf-container').show();
            } else {
                $('#reorder-pages-status').text('Error: ' + response.data.message).css('color', 'red');
                $('#download-reordered-pdf-container').hide();
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            $('#reorder-pages-status').text('An AJAX error occurred: ' + textStatus).css('color', 'red');
            console.error("AJAX Error:", textStatus, errorThrown, jqXHR.responseText);
        }
    });
});

// In custom.js

// --- Word to PDF Form Handler ---
$('#word-to-pdf-form').on('submit', function(e) {
    e.preventDefault();

    var formData = new FormData(this);
    formData.append('action', 'dw_word_to_pdf');
    formData.append('nonce', dw_ajax.word_to_pdf_nonce); // Make sure to add this nonce in wp_localize_script

    $('#word-to-pdf-status').text('Processing... Please wait, this may take a moment.').css('color', 'blue');
    $('#download-word-to-pdf-container').hide();

    $.ajax({
        url: dw_ajax.ajaxurl,
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        success: function(response) {
            if (response.success) {
                $('#word-to-pdf-status').text(response.data.message).css('color', 'green');
                $('#download-word-to-pdf').attr('href', response.data.download_url);
                $('#download-word-to-pdf-container').show();
            } else {
                $('#word-to-pdf-status').text('Error: ' + response.data.message).css('color', 'red');
                $('#download-word-to-pdf-container').hide();
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            $('#word-to-pdf-status').text('An AJAX error occurred: ' + textStatus).css('color', 'red');
            console.error("AJAX Error:", textStatus, errorThrown, jqXHR.responseText);
        }
    });
});

// --- PDF to Text Form Handler ---
$('#pdf-to-text-form').on('submit', function(e) {
    e.preventDefault();

    var formData = new FormData(this);
    formData.append('action', 'dw_pdf_to_text');
    formData.append('nonce', dw_ajax.pdf_to_text_nonce); // Make sure to add this nonce in wp_localize_script

    $('#pdf-to-text-status').text('Processing... Please wait, this may take a moment.').css('color', 'blue');
    $('#download-pdf-to-text-container').hide();

    $.ajax({
        url: dw_ajax.ajaxurl,
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        success: function(response) {
            if (response.success) {
                $('#pdf-to-text-status').text(response.data.message).css('color', 'green');
                $('#download-pdf-to-text').attr('href', response.data.download_url);
                $('#download-pdf-to-text-container').show();
            } else {
                $('#pdf-to-text-status').text('Error: ' + response.data.message).css('color', 'red');
                $('#download-pdf-to-text-container').hide();
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            $('#pdf-to-text-status').text('An AJAX error occurred: ' + textStatus).css('color', 'red');
            console.error("AJAX Error:", textStatus, errorThrown, jqXHR.responseText);
        }
    });
});

// --- Repair PDF Form Handler ---
$('#repair-pdf-form').on('submit', function(e) {
    e.preventDefault();

    var formData = new FormData(this);
    formData.append('action', 'dw_repair_pdf');
    formData.append('nonce', dw_ajax.repair_pdf_nonce); // Make sure to add this nonce in wp_localize_script

    $('#repair-pdf-status').text('Processing... Please wait, this may take a moment.').css('color', 'blue');
    $('#download-repair-pdf-container').hide();

    $.ajax({
        url: dw_ajax.ajaxurl,
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        success: function(response) {
            if (response.success) {
                $('#repair-pdf-status').text(response.data.message).css('color', 'green');
                $('#download-repair-pdf').attr('href', response.data.download_url);
                $('#download-repair-pdf-container').show();
            } else {
                $('#repair-pdf-status').text('Error: ' + response.data.message).css('color', 'red');
                $('#download-repair-pdf-container').hide();
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            $('#repair-pdf-status').text('An AJAX error occurred: ' + textStatus).css('color', 'red');
            console.error("AJAX Error:", textStatus, errorThrown, jqXHR.responseText);
        }
    });
});

// --- PDF to HTML Form Handler ---
$('#pdf-to-html-form').on('submit', function(e) {
    e.preventDefault();

    var formData = new FormData(this);
    formData.append('action', 'dw_pdf_to_html');
    formData.append('nonce', dw_ajax.pdf_to_html_nonce); // Make sure to add this nonce in wp_localize_script

    $('#pdf-to-html-status').text('Processing... Please wait, this may take a moment.').css('color', 'blue');
    $('#download-pdf-to-html-container').hide();

    $.ajax({
        url: dw_ajax.ajaxurl,
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        success: function(response) {
            if (response.success) {
                $('#pdf-to-html-status').text(response.data.message).css('color', 'green');
                $('#download-pdf-to-html').attr('href', response.data.download_url);
                $('#download-pdf-to-html-container').show();
            } else {
                $('#pdf-to-html-status').text('Error: ' + response.data.message).css('color', 'red');
                $('#download-pdf-to-html-container').hide();
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            $('#pdf-to-html-status').text('An AJAX error occurred: ' + textStatus).css('color', 'red');
            console.error("AJAX Error:", textStatus, errorThrown, jqXHR.responseText);
        }
    });
});

// --- PDF to Grayscale Form Handler ---
$('#pdf-to-grayscale-form').on('submit', function(e) {
    e.preventDefault();

    var formData = new FormData(this);
    formData.append('action', 'dw_pdf_to_grayscale');
    formData.append('nonce', dw_ajax.pdf_to_grayscale_nonce); // Make sure to add this nonce in wp_localize_script

    $('#pdf-to-grayscale-status').text('Processing... Please wait, this may take a moment.').css('color', 'blue');
    $('#download-pdf-to-grayscale-container').hide();

    $.ajax({
        url: dw_ajax.ajaxurl,
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        success: function(response) {
            if (response.success) {
                $('#pdf-to-grayscale-status').text(response.data.message).css('color', 'green');
                $('#download-pdf-to-grayscale').attr('href', response.data.download_url);
                $('#download-pdf-to-grayscale-container').show();
            } else {
                $('#pdf-to-grayscale-status').text('Error: ' + response.data.message).css('color', 'red');
                $('#download-pdf-to-grayscale-container').hide();
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            $('#pdf-to-grayscale-status').text('An AJAX error occurred: ' + textStatus).css('color', 'red');
            console.error("AJAX Error:", textStatus, errorThrown, jqXHR.responseText);
        }
    });
});

jQuery(document).ready(function($) {
    // Ensure the form exists on the page before attaching event listener
    if ($('#dw-unlock-pdf-form').length) {
        $('#dw-unlock-pdf-form').on('submit', function(e) {
            e.preventDefault(); // Prevent default form submission

            var formData = new FormData(this);
            formData.append('action', 'dw_unlock_pdf'); // Correct AJAX action hook
            formData.append('nonce', dw_unlock_pdf_ajax.nonce); // Nonce from wp_localize_script

            var statusDiv = $('#dw-unlock-pdf-status');
            var downloadContainer = $('#download-unlock-pdf-container');
            var downloadLink = $('#download-unlock-pdf');

            // Reset status and hide download link
            statusDiv.html('Processing... Please wait. This might take a moment.').css('color', '#007bff');
            downloadContainer.hide();

            $.ajax({
                url: dw_unlock_pdf_ajax.ajax_url, // AJAX URL from wp_localize_script
                type: 'POST',
                data: formData,
                processData: false, // Important for FormData
                contentType: false, // Important for FormData
                success: function(response) {
                    if (response.success) {
                        statusDiv.html(response.data.message).css('color', '#28a745'); // Green for success
                        if (response.data.download_url) {
                            downloadLink.attr('href', response.data.download_url);
                            downloadContainer.show();
                        }
                    } else {
                        statusDiv.html('Error: ' + response.data.message).css('color', '#dc3545'); // Red for error
                        downloadContainer.hide();
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    statusDiv.html('AJAX Error: ' + textStatus + ' - ' + errorThrown + '. Check browser console for details.').css('color', '#dc3545');
                    downloadContainer.hide();
                    console.error("AJAX Error Response:", jqXHR.responseText); // Log full error for debugging
                }
            });
        });
    }
});
// custom.js (add this section)

// custom.js

// --- Crop PDF Form Handler ---
$('#crop-pdf-form').on('submit', function(e) {
    e.preventDefault(); // Prevent default form submission

    var formData = new FormData(this);
    formData.append('action', 'dw_crop_pdf');

    // IMPORTANT: UNCOMMENT THE NONCE LINE AND ENSURE IT'S CORRECT
    if (typeof dw_ajax !== 'undefined' && dw_ajax.crop_pdf_nonce) {
        formData.append('nonce', dw_ajax.crop_pdf_nonce);
    } else {
        // Log an error if nonce is missing (crucial for security)
        console.error('Nonce for crop_pdf is missing. AJAX request aborted.');
        $('#crop-pdf-status').text('Error: Security nonce missing. Please refresh the page.').css('color', 'red');
        return; // Stop execution if nonce is not available
    }

    // Update status message and hide download link
    $('#crop-pdf-status').text('Processing... Cropping PDF. This may take a moment.').css('color', 'blue');
    $('#download-cropped-pdf-container').hide();

    $.ajax({
        url: dw_ajax.ajaxurl, // WordPress AJAX URL
        type: 'POST',
        data: formData,
        contentType: false, // Essential for FormData
        processData: false, // Essential for FormData
        success: function(response) {
            // Check for valid JSON response and success status
            if (response && response.success) {
                $('#crop-pdf-status').text(response.data.message).css('color', 'green');
                $('#download-cropped-pdf').attr('href', response.data.download_url);
                $('#download-cropped-pdf-container').show();
            } else {
                // Extract error message from response, or provide a generic one
                var errorMessage = 'An unknown error occurred.';
                if (response && response.data && response.data.message) {
                    errorMessage = response.data.message;
                } else if (response && response.data) {
                    // Fallback for cases where 'message' might not be directly under 'data'
                    errorMessage = JSON.stringify(response.data);
                } else if (response) {
                    errorMessage = JSON.stringify(response);
                }
                $('#crop-pdf-status').text('Error: ' + errorMessage).css('color', 'red');
                $('#download-cropped-pdf-container').hide();
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            // Detailed error logging
            console.error("AJAX Error Status:", textStatus);
            console.error("HTTP Error Thrown:", errorThrown);
            console.error("Server Response:", jqXHR.responseText);

            var displayMessage = 'An AJAX error occurred: ' + textStatus;
            if (jqXHR.status) {
                displayMessage += ' (HTTP ' + jqXHR.status + ')';
            }
            if (jqXHR.responseText) {
                // Truncate responseText to avoid excessively long messages
                displayMessage += '. Server response snippet: ' + jqXHR.responseText.substring(0, 150) + '...';
            }
            $('#crop-pdf-status').text(displayMessage).css('color', 'red');
            $('#download-cropped-pdf-container').hide();
        }
    });
});
// custom.js

// ... (Your existing AJAX handlers for crop, compare, etc.)

// --- Sign PDF Form Handler ---
$('#sign-pdf-form').on('submit', function(e) {
    e.preventDefault();

    var formData = new FormData(this);
    formData.append('action', 'dw_sign_pdf');

    // IMPORTANT: Add your nonce here for security
    if (typeof dw_ajax !== 'undefined' && dw_ajax.sign_pdf_nonce) {
        formData.append('nonce', dw_ajax.sign_pdf_nonce);
    } else {
        console.error('Nonce for sign_pdf is missing. AJAX request aborted.');
        $('#sign-pdf-status').text('Error: Security nonce missing. Please refresh the page.').css('color', 'red');
        return;
    }

    $('#sign-pdf-status').text('Processing... Adding signature to PDF.').css('color', 'blue');
    $('#download-signed-pdf-container').hide();

    $.ajax({
        url: dw_ajax.ajaxurl,
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        success: function(response) {
            if (response && response.success) {
                $('#sign-pdf-status').text(response.data.message).css('color', 'green');
                $('#download-signed-pdf').attr('href', response.data.download_url);
                $('#download-signed-pdf-container').show();
            } else {
                var errorMessage = (response && response.data && response.data.message) ? response.data.message : 'An unknown error occurred on the server.';
                $('#sign-pdf-status').text('Error: ' + errorMessage).css('color', 'red');
                $('#download-signed-pdf-container').hide();
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error("AJAX Error:", textStatus, errorThrown, jqXHR.responseText);
            var displayMessage = 'An AJAX error occurred: ' + textStatus;
            if (jqXHR.status) {
                displayMessage += ' (HTTP ' + jqXHR.status + ')';
            }
            if (jqXHR.responseText) {
                displayMessage += '. Server response snippet: ' + jqXHR.responseText.substring(0, 150) + '...';
            }
            $('#sign-pdf-status').text(displayMessage).css('color', 'red');
            $('#download-signed-pdf-container').hide();
        }
    });
});

// --- Organize PDF Tab Logic ---
$(document).ready(function() {
    $('.organize-tab-button').on('click', function() {
        var targetSectionId = $(this).data('target');

        // Update button styles
        $('.organize-tab-button').css({
            'background-color': '#f0f0f0',
            'color': '#333',
            'border': '1px solid #ccc'
        });
        $(this).css({
            'background-color': '#007bff',
            'color': 'white',
            'border': 'none'
        });

        // Hide all sections and show the target one
        $('.organize-section').hide();
        $('#' + targetSectionId).show();
    });

    // Handle Split Method radio button change
    $('input[name="split_method"]').on('change', function() {
        if ($(this).val() === 'range') {
            $('#split-range-input').show();
            $('#page_ranges').prop('required', true); // Make required if splitting by range
        } else {
            $('#split-range-input').hide();
            $('#page_ranges').prop('required', false); // Not required if splitting every page
        }
    });

    // Trigger click on the default active tab to set initial state
    $('.organize-tab-button[data-target="merge-pdf-section"]').click(); // Ensure merge is active by default
});

// --- Merge PDF Form Handler ---
$('#merge-pdf-form').on('submit', function(e) {
    e.preventDefault();

    var formData = new FormData(this);
    formData.append('action', 'dw_merge_pdf');

    if (typeof dw_ajax !== 'undefined' && dw_ajax.organize_pdf_nonce) {
        formData.append('nonce', dw_ajax.organize_pdf_nonce);
    } else {
        console.error('Nonce for organize_pdf is missing. AJAX request aborted.');
        $('#merge-pdf-status').text('Error: Security nonce missing. Please refresh the page.').css('color', 'red');
        return;
    }

    $('#merge-pdf-status').text('Processing... Merging PDFs. This may take a moment.').css('color', 'blue');
    $('#download-merged-pdf-container').hide();

    $.ajax({
        url: dw_ajax.ajaxurl,
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        success: function(response) {
            if (response && response.success) {
                $('#merge-pdf-status').text(response.data.message).css('color', 'green');
                $('#download-merged-pdf').attr('href', response.data.download_url);
                $('#download-merged-pdf-container').show();
            } else {
                var errorMessage = (response && response.data && response.data.message) ? response.data.message : 'An unknown error occurred.';
                $('#merge-pdf-status').text('Error: ' + errorMessage).css('color', 'red');
                $('#download-merged-pdf-container').hide();
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error("AJAX Error:", textStatus, errorThrown, jqXHR.responseText);
            var displayMessage = 'An AJAX error occurred: ' + textStatus;
            if (jqXHR.status) {
                displayMessage += ' (HTTP ' + jqXHR.status + ')';
            }
            if (jqXHR.responseText) {
                displayMessage += '. Server response snippet: ' + jqXHR.responseText.substring(0, 150) + '...';
            }
            $('#merge-pdf-status').text(displayMessage).css('color', 'red');
            $('#download-merged-pdf-container').hide();
        }
    });
});
// split pdf
$('#pdf-split-form').on('submit', function(e) {
        e.preventDefault();

        var formData = new FormData(this);
        formData.append('action', 'dw_split_pdfs');
        formData.append('nonce', dw_ajax.split_nonce);

        $('#split-status').text('Processing... Please wait, this may take a moment.').css('color', 'blue');
        $('#download-split-pdfs-container').empty().hide(); // Clear and hide previous links

        $.ajax({
            url: dw_ajax.ajaxurl,
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: function(response) {
                if (response.success) {
                    $('#split-status').text(response.data.message).css('color', 'green');
                    var $container = $('#download-split-pdfs-container');
                    $container.empty(); // Clear any previous links

                    if (response.data.split_files && response.data.split_files.length > 0) {
                        $.each(response.data.split_files, function(index, file) {
                            $container.append('<p><a href="' + file.download_url + '" download style="background-color: #28a745; color: white; padding: 8px 12px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 5px;">Download Page ' + file.page_number + '</a></p>');
                        });
                        $container.show();
                    } else {
                        $('#split-status').text('Splitting completed, but no files to download.').css('color', 'orange');
                    }

                } else {
                    $('#split-status').text('Error: ' + response.data.message).css('color', 'red');
                    $('#download-split-pdfs-container').hide();
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                $('#split-status').text('An AJAX error occurred: ' + textStatus).css('color', 'red');
                console.error("AJAX Error:", textStatus, errorThrown, jqXHR.responseText);
            }
        });
    });

});