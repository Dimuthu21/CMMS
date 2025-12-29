$(function () {
    $(document).on('change', 'input[type=file][name="Attachments"]', function () {

        const files = this.files;
        if (files && files.length) {
            const names = Array.from(files).map(f => f.name).join(', ');
            console.log('Selected files:', names);
        }
    });

    $('.chatbot').on('click', function () {

        if ($('.chatbot-window').length === 0) {
            const win = $(
                '<div class="chatbot-window shadow-sm rounded">\
                    <div class="chatbot-header d-flex justify-content-between align-items-center p-2">\
                        <strong>Support Chat</strong>\
                        <button type="button" class="btn-close chatbot-close" aria-label="Close"></button>\
                    </div>\
                    <div class="chatbot-body p-2">\
                        <div class="chatbot-messages" style="min-height:160px;">Welcome! How can we help you today?</div>\
                        <div class="mt-2 d-flex gap-2">\
                            <input type="text" class="form-control chatbot-input" placeholder="Type a message..." />\
                            <button class="btn btn-primary chatbot-send">Send</button>\
                        </div>\
                    </div>\
                </div>'
            );
            $('body').append(win);

            // close handler
            $('.chatbot-close').on('click', function () { $('.chatbot-window').remove(); });

            // send handler (fake echo)
            $('.chatbot-send').on('click', function () {
                const txt = $('.chatbot-input').val().trim();
                if (!txt) return;
                const messages = $('.chatbot-messages');
                messages.append('<div><strong>You:</strong> ' + $('<div/>').text(txt).html() + '</div>');
                $('.chatbot-input').val('');
                // simulate bot reply
                setTimeout(() => {
                    messages.append('<div><strong>Bot:</strong> This is an automated reply.</div>');
                }, 600);
            });
        }
        $('.chatbot-window').toggle();
    });
});