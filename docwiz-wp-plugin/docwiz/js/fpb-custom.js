jQuery(document).ready(function($) {
    // Generic function to handle form submission for all tools
    function handleToolFormSubmit(e) {
        e.preventDefault(); // Prevent default form submission

        var $form = $(this);
        var toolName = $form.attr('id').replace('fpb-', '').replace('-form', ''); // e.g., 'merge', 'split', 'compress'

        var formData = new FormData(this);
        formData.append('action', 'fpb_' + toolName + '_pdf'); // e.g., 'fpb_merge_pdf', 'fpb_split_pdf'
        formData.append('security', fpbAjax.nonce); // Security nonce

        var $status = $('.fpb-status[data-tool="' + toolName + '"]');
        var $downloadArea = $('.fpb-download-area[data-tool="' + toolName + '"]');
        var $downloadLink = $downloadArea.find('a');
        var $button = $form.find('button[type="submit"]');
        var $fileInput = $form.find('input[type="file"]');

        // Reset previous status/download messages
        $status.hide().removeClass('success error').text('');
        $downloadArea.hide();
        $downloadLink.attr('href', '#'); // Clear previous download link

        // --- Specific Tool Validations ---
        if (toolName === 'merge') {
            if ($fileInput[0].files.length < 2) {
                $status.addClass('error').text('Please select at least two PDF files to merge.').show();
                return;
            }
        } else if (toolName === 'split') {
            if ($fileInput[0].files.length === 0) {
                $status.addClass('error').text('Please upload a PDF file.').show();
                return;
            }
            if ($form.find('#split-pages').val().trim() === '') {
                $status.addClass('error').text('Please specify pages to split.').show();
                return;
            }
        } else if (toolName === 'compress') {
            if ($fileInput[0].files.length === 0) {
                $status.addClass('error').text('Please upload a PDF file.').show();
                return;
            }
        }

        // Disable button and show loading status
        $button.prop('disabled', true).text(toolName.charAt(0).toUpperCase() + toolName.slice(1) + 'ing...');
        $status.addClass('success').text('Processing PDF... Please wait.').show();

        // Perform AJAX request
        $.ajax({
            url: fpbAjax.ajaxurl,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                if (response.success) {
                    $status.removeClass('error').addClass('success').text('PDF processed successfully!');
                    $downloadLink.attr('href', response.data.download_url);
                    $downloadArea.show();
                } else {
                    $status.removeClass('success').addClass('error').text('Error: ' + (response.data || 'An unknown error occurred.'));
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                $status.removeClass('success').addClass('error').text('AJAX Error: ' + textStatus + ' - ' + errorThrown);
            },
            complete: function() {
                $button.prop('disabled', false).text(toolName.charAt(0).toUpperCase() + toolName.slice(1) + ' PDF');
            }
        });
    }

    // Attach the generic handler to each form
    $('#fpb-merge-form').on('submit', handleToolFormSubmit);
    $('#fpb-split-form').on('submit', handleToolFormSubmit);
    $('#fpb-compress-form').on('submit', handleToolFormSubmit);
});
