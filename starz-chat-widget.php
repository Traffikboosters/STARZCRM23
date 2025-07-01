<?php
/**
 * Plugin Name: STARZ Chat Widget
 * Plugin URI: https://traffikboosters.com
 * Description: Professional chat widget for lead generation and customer engagement with real-time notifications and video consultation capabilities.
 * Version: 1.0.0
 * Author: Traffik Boosters
 * Author URI: https://traffikboosters.com
 * License: GPL v2 or later
 * Text Domain: starz-chat-widget
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('STARZ_CHAT_PLUGIN_URL', plugin_dir_url(__FILE__));
define('STARZ_CHAT_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('STARZ_CHAT_VERSION', '1.0.0');

class StarzChatWidget {
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('wp_footer', array($this, 'render_chat_widget'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'settings_init'));
        add_action('wp_ajax_starz_chat_submit', array($this, 'handle_chat_submission'));
        add_action('wp_ajax_nopriv_starz_chat_submit', array($this, 'handle_chat_submission'));
        register_activation_hook(__FILE__, array($this, 'activate'));
    }
    
    public function init() {
        // Plugin initialization
    }
    
    public function activate() {
        // Set default options
        $default_options = array(
            'enabled' => true,
            'position' => 'bottom-right',
            'primary_color' => '#ea580c',
            'welcome_message' => 'Hi! How can we help boost your traffic and sales today?',
            'business_hours' => array(
                'start' => '09:00',
                'end' => '18:00',
                'timezone' => 'America/New_York'
            ),
            'contact_email' => 'starz@traffikboosters.com',
            'phone_number' => '(877) 840-6250',
            'company_name' => 'Traffik Boosters',
            'crm_api_url' => 'https://your-starz-instance.replit.app/api/chat-widget-submit'
        );
        
        add_option('starz_chat_options', $default_options);
    }
    
    public function enqueue_scripts() {
        $options = get_option('starz_chat_options');
        if (!$options || !$options['enabled']) {
            return;
        }
        
        wp_enqueue_script('jquery');
        
        // Inline the chat widget JavaScript
        add_action('wp_footer', array($this, 'output_chat_script'), 100);
        add_action('wp_footer', array($this, 'output_chat_styles'), 99);
    }
    
    public function output_chat_styles() {
        $options = get_option('starz_chat_options');
        ?>
        <style id="starz-chat-styles">
        .starz-chat-widget {
            position: fixed;
            z-index: 9999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .starz-chat-bottom-right {
            bottom: 20px;
            right: 20px;
        }
        
        .starz-chat-bottom-left {
            bottom: 20px;
            left: 20px;
        }
        
        .starz-chat-toggle {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, <?php echo esc_attr($options['primary_color']); ?> 0%, #f97316 100%);
            border: none;
            box-shadow: 0 4px 20px rgba(234, 88, 12, 0.3);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            color: white;
            font-size: 24px;
        }
        
        .starz-chat-toggle:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 25px rgba(234, 88, 12, 0.4);
        }
        
        .starz-chat-panel {
            position: absolute;
            bottom: 80px;
            right: 0;
            width: 350px;
            height: 500px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
            display: none;
            flex-direction: column;
            overflow: hidden;
            animation: slideUp 0.3s ease;
        }
        
        @media (max-width: 480px) {
            .starz-chat-panel {
                width: 320px;
                height: 450px;
            }
        }
        
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .starz-chat-header {
            background: linear-gradient(135deg, <?php echo esc_attr($options['primary_color']); ?> 0%, #f97316 100%);
            color: white;
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .starz-chat-logo {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: <?php echo esc_attr($options['primary_color']); ?>;
            font-size: 14px;
        }
        
        .starz-chat-title {
            flex: 1;
        }
        
        .starz-chat-title h3 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
        }
        
        .starz-chat-subtitle {
            font-size: 12px;
            opacity: 0.9;
            margin: 2px 0 0 0;
        }
        
        .starz-chat-close {
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            transition: background 0.2s;
        }
        
        .starz-chat-close:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        
        .starz-chat-body {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
        }
        
        .starz-chat-form {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        
        .starz-chat-input {
            width: 100%;
            padding: 12px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.2s;
            box-sizing: border-box;
        }
        
        .starz-chat-input:focus {
            outline: none;
            border-color: <?php echo esc_attr($options['primary_color']); ?>;
        }
        
        .starz-chat-textarea {
            min-height: 80px;
            resize: vertical;
            font-family: inherit;
        }
        
        .starz-chat-submit {
            background: linear-gradient(135deg, <?php echo esc_attr($options['primary_color']); ?> 0%, #f97316 100%);
            color: white;
            border: none;
            padding: 14px 24px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .starz-chat-submit:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(234, 88, 12, 0.3);
        }
        
        .starz-chat-submit:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        
        .starz-chat-message {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            color: #15803d;
            padding: 12px;
            border-radius: 8px;
            font-size: 14px;
            text-align: center;
        }
        
        .starz-chat-error {
            background: #fef2f2;
            border: 1px solid #fecaca;
            color: #dc2626;
        }
        
        .starz-business-hours {
            background: #fefce8;
            border: 1px solid #fde047;
            color: #a16207;
            padding: 12px;
            border-radius: 8px;
            font-size: 12px;
            margin-bottom: 16px;
            text-align: center;
        }
        
        .starz-status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            margin-right: 6px;
            display: inline-block;
        }
        
        .starz-status-online {
            background: #10b981;
        }
        
        .starz-status-offline {
            background: #f59e0b;
        }
        </style>
        <?php
    }
    
    public function output_chat_script() {
        $options = get_option('starz_chat_options');
        ?>
        <script id="starz-chat-script">
        (function($) {
            'use strict';
            
            var StarzChat = {
                options: <?php echo json_encode($options); ?>,
                isOpen: false,
                
                init: function() {
                    this.createWidget();
                    this.bindEvents();
                    this.checkBusinessHours();
                },
                
                createWidget: function() {
                    var widget = $('<div class="starz-chat-widget starz-chat-' + this.options.position + '"></div>');
                    
                    var toggle = $('<button class="starz-chat-toggle" title="Chat with us">💬</button>');
                    
                    var panel = $('<div class="starz-chat-panel"></div>');
                    var header = this.createHeader();
                    var body = this.createBody();
                    
                    panel.append(header).append(body);
                    widget.append(toggle).append(panel);
                    
                    $('body').append(widget);
                    
                    this.$widget = widget;
                    this.$toggle = toggle;
                    this.$panel = panel;
                },
                
                createHeader: function() {
                    var isOnline = this.isBusinessHours();
                    var statusText = isOnline ? 'Online Now' : 'Will Call Within 24hrs';
                    var statusClass = isOnline ? 'starz-status-online' : 'starz-status-offline';
                    
                    return $([
                        '<div class="starz-chat-header">',
                            '<div class="starz-chat-logo">TB</div>',
                            '<div class="starz-chat-title">',
                                '<h3>' + this.options.company_name + '</h3>',
                                '<div class="starz-chat-subtitle">',
                                    '<span class="starz-status-dot ' + statusClass + '"></span>',
                                    statusText,
                                '</div>',
                            '</div>',
                            '<button class="starz-chat-close">&times;</button>',
                        '</div>'
                    ].join(''));
                },
                
                createBody: function() {
                    var body = $('<div class="starz-chat-body"></div>');
                    
                    if (!this.isBusinessHours()) {
                        body.append([
                            '<div class="starz-business-hours">',
                                '🕐 Outside business hours. We\'ll call within 24 business hours!',
                            '</div>'
                        ].join(''));
                    }
                    
                    var form = $([
                        '<form class="starz-chat-form">',
                            '<input type="text" name="name" class="starz-chat-input" placeholder="Your Name *" required>',
                            '<input type="email" name="email" class="starz-chat-input" placeholder="Business Email *" required>',
                            '<input type="text" name="company" class="starz-chat-input" placeholder="Company Name *" required>',
                            '<input type="tel" name="phone" class="starz-chat-input" placeholder="Phone Number">',
                            '<textarea name="message" class="starz-chat-input starz-chat-textarea" placeholder="How can we help boost your traffic and sales?"></textarea>',
                            '<button type="submit" class="starz-chat-submit">Get Free Consultation</button>',
                        '</form>'
                    ].join(''));
                    
                    body.append(form);
                    return body;
                },
                
                bindEvents: function() {
                    var self = this;
                    
                    this.$toggle.on('click', function() {
                        self.togglePanel();
                    });
                    
                    this.$panel.find('.starz-chat-close').on('click', function() {
                        self.closePanel();
                    });
                    
                    this.$panel.find('.starz-chat-form').on('submit', function(e) {
                        e.preventDefault();
                        self.submitForm($(this));
                    });
                },
                
                togglePanel: function() {
                    if (this.isOpen) {
                        this.closePanel();
                    } else {
                        this.openPanel();
                    }
                },
                
                openPanel: function() {
                    this.$panel.show();
                    this.isOpen = true;
                },
                
                closePanel: function() {
                    this.$panel.hide();
                    this.isOpen = false;
                },
                
                submitForm: function($form) {
                    var $submit = $form.find('.starz-chat-submit');
                    var originalText = $submit.text();
                    
                    $submit.prop('disabled', true).text('Sending...');
                    
                    var formData = {
                        action: 'starz_chat_submit',
                        nonce: '<?php echo wp_create_nonce("starz_chat_nonce"); ?>',
                        name: $form.find('[name="name"]').val(),
                        email: $form.find('[name="email"]').val(),
                        company: $form.find('[name="company"]').val(),
                        phone: $form.find('[name="phone"]').val(),
                        message: $form.find('[name="message"]').val()
                    };
                    
                    $.post('<?php echo admin_url("admin-ajax.php"); ?>', formData)
                        .done(function(response) {
                            if (response.success) {
                                $form.html('<div class="starz-chat-message">' + response.data.message + '</div>');
                            } else {
                                $form.append('<div class="starz-chat-message starz-chat-error">Something went wrong. Please try again.</div>');
                                $submit.prop('disabled', false).text(originalText);
                            }
                        })
                        .fail(function() {
                            $form.append('<div class="starz-chat-message starz-chat-error">Connection error. Please try again.</div>');
                            $submit.prop('disabled', false).text(originalText);
                        });
                },
                
                isBusinessHours: function() {
                    var now = new Date();
                    var hours = now.getHours();
                    var day = now.getDay();
                    
                    // Monday = 1, Sunday = 0
                    if (day === 0 || day === 6) return false; // Weekend
                    
                    var startHour = parseInt(this.options.business_hours.start.split(':')[0]);
                    var endHour = parseInt(this.options.business_hours.end.split(':')[0]);
                    
                    return hours >= startHour && hours < endHour;
                },
                
                checkBusinessHours: function() {
                    // Update status every 60 seconds
                    var self = this;
                    setInterval(function() {
                        if (self.$panel && self.$panel.is(':visible')) {
                            var header = self.createHeader();
                            self.$panel.find('.starz-chat-header').replaceWith(header);
                            self.bindEvents();
                        }
                    }, 60000);
                }
            };
            
            $(document).ready(function() {
                StarzChat.init();
            });
            
        })(jQuery);
        </script>
        <?php
    }
    
    public function render_chat_widget() {
        // Widget is rendered via JavaScript
    }
    
    public function handle_chat_submission() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'starz_chat_nonce')) {
            wp_die('Security check failed');
        }
        
        $name = sanitize_text_field($_POST['name']);
        $email = sanitize_email($_POST['email']);
        $company = sanitize_text_field($_POST['company']);
        $phone = sanitize_text_field($_POST['phone']);
        $message = sanitize_textarea_field($_POST['message']);
        $source = 'WordPress Chat Widget';
        
        // Send to STARZ CRM API
        $this->send_to_crm($name, $email, $company, $phone, $message, $source);
        
        // Send auto-reply email
        $this->send_auto_reply($email, $name);
        
        wp_send_json_success(array(
            'message' => 'Thank you! We\'ll contact you within 24 business hours.'
        ));
    }
    
    private function send_to_crm($name, $email, $company, $phone, $message, $source) {
        $options = get_option('starz_chat_options');
        $api_url = $options['crm_api_url'];
        
        $data = array(
            'name' => $name,
            'email' => $email,
            'company' => $company,
            'phone' => $phone,
            'message' => $message,
            'source' => $source,
            'timestamp' => current_time('mysql'),
            'website' => get_site_url()
        );
        
        $response = wp_remote_post($api_url, array(
            'body' => json_encode($data),
            'headers' => array(
                'Content-Type' => 'application/json'
            ),
            'timeout' => 30
        ));
        
        if (is_wp_error($response)) {
            error_log('STARZ Chat Widget: Failed to send to CRM - ' . $response->get_error_message());
        }
    }
    
    private function send_auto_reply($email, $name) {
        $options = get_option('starz_chat_options');
        $subject = 'Thank you for contacting ' . $options['company_name'];
        
        $message = "
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .header { background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); padding: 30px; text-align: center; }
                .content { padding: 30px; background: #fff; }
                .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
                .highlight { color: #ea580c; font-weight: bold; }
                .logo { color: white; font-size: 24px; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class='header'>
                <div class='logo'>TRAFFIK BOOSTERS</div>
                <h1 style='color: white; margin: 20px 0 0 0;'>More Traffik! More Sales!</h1>
            </div>
            
            <div class='content'>
                <h2>Hi " . esc_html($name) . ",</h2>
                
                <p>Thank you for reaching out to <span class='highlight'>Traffik Boosters</span>! We've received your inquiry and our growth experts are already reviewing your request.</p>
                
                <p><strong>What happens next?</strong></p>
                <ul>
                    <li>A growth expert will call you within <span class='highlight'>24 business hours</span></li>
                    <li>We'll discuss your specific traffic and sales goals</li>
                    <li>You'll receive a customized strategy proposal</li>
                    <li>No monthly contracts - project-based solutions only</li>
                </ul>
                
                <p><strong>Need immediate assistance?</strong><br>
                Call us directly: <span class='highlight'>" . $options['phone_number'] . "</span></p>
                
                <p>We're excited to help boost your traffic and sales!</p>
                
                <p>Best regards,<br>
                <strong>The Traffik Boosters Team</strong></p>
            </div>
            
            <div class='footer'>
                <p>© 2025 Traffik Boosters. All rights reserved.<br>
                This email was sent because you contacted us through our website chat.</p>
            </div>
        </body>
        </html>
        ";
        
        $headers = array(
            'Content-Type: text/html; charset=UTF-8',
            'From: ' . $options['company_name'] . ' <' . $options['contact_email'] . '>'
        );
        
        wp_mail($email, $subject, $message, $headers);
    }
    
    public function add_admin_menu() {
        add_options_page(
            'STARZ Chat Widget',
            'STARZ Chat Widget',
            'manage_options',
            'starz-chat-widget',
            array($this, 'admin_page')
        );
    }
    
    public function settings_init() {
        register_setting('starz_chat_settings', 'starz_chat_options');
        
        add_settings_section(
            'starz_chat_section',
            'Chat Widget Settings',
            null,
            'starz_chat_settings'
        );
        
        add_settings_field(
            'enabled',
            'Enable Chat Widget',
            array($this, 'checkbox_field'),
            'starz_chat_settings',
            'starz_chat_section',
            array('field' => 'enabled')
        );
        
        add_settings_field(
            'position',
            'Widget Position',
            array($this, 'select_field'),
            'starz_chat_settings',
            'starz_chat_section',
            array(
                'field' => 'position',
                'options' => array(
                    'bottom-right' => 'Bottom Right',
                    'bottom-left' => 'Bottom Left'
                )
            )
        );
        
        add_settings_field(
            'welcome_message',
            'Welcome Message',
            array($this, 'text_field'),
            'starz_chat_settings',
            'starz_chat_section',
            array('field' => 'welcome_message')
        );
        
        add_settings_field(
            'contact_email',
            'Contact Email',
            array($this, 'text_field'),
            'starz_chat_settings',
            'starz_chat_section',
            array('field' => 'contact_email')
        );
        
        add_settings_field(
            'phone_number',
            'Phone Number',
            array($this, 'text_field'),
            'starz_chat_settings',
            'starz_chat_section',
            array('field' => 'phone_number')
        );
        
        add_settings_field(
            'crm_api_url',
            'CRM API URL',
            array($this, 'text_field'),
            'starz_chat_settings',
            'starz_chat_section',
            array('field' => 'crm_api_url')
        );
    }
    
    public function admin_page() {
        ?>
        <div class="wrap">
            <h1>STARZ Chat Widget Settings</h1>
            <form action="options.php" method="post">
                <?php
                settings_fields('starz_chat_settings');
                do_settings_sections('starz_chat_settings');
                submit_button();
                ?>
            </form>
            
            <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-left: 4px solid #ea580c;">
                <h3 style="color: #ea580c;">Installation Complete!</h3>
                <p>Your STARZ chat widget is now active on your website. Visitors can contact you through the chat bubble, and all inquiries will be automatically sent to your CRM system.</p>
                
                <h4>Features:</h4>
                <ul>
                    <li>Real-time lead capture</li>
                    <li>Automatic email responses</li>
                    <li>Business hours detection</li>
                    <li>Mobile-responsive design</li>
                    <li>Integration with STARZ CRM</li>
                </ul>
                
                <p><strong>Support:</strong> For technical assistance, contact <a href="mailto:starz@traffikboosters.com">starz@traffikboosters.com</a></p>
            </div>
        </div>
        <?php
    }
    
    public function checkbox_field($args) {
        $options = get_option('starz_chat_options');
        $field = $args['field'];
        $checked = isset($options[$field]) && $options[$field] ? 'checked' : '';
        echo "<input type='checkbox' name='starz_chat_options[{$field}]' value='1' {$checked}>";
    }
    
    public function text_field($args) {
        $options = get_option('starz_chat_options');
        $field = $args['field'];
        $value = isset($options[$field]) ? esc_attr($options[$field]) : '';
        echo "<input type='text' name='starz_chat_options[{$field}]' value='{$value}' class='regular-text'>";
    }
    
    public function select_field($args) {
        $options = get_option('starz_chat_options');
        $field = $args['field'];
        $current = isset($options[$field]) ? $options[$field] : '';
        
        echo "<select name='starz_chat_options[{$field}]'>";
        foreach ($args['options'] as $value => $label) {
            $selected = ($current === $value) ? 'selected' : '';
            echo "<option value='{$value}' {$selected}>{$label}</option>";
        }
        echo "</select>";
    }
}

// Initialize the plugin
new StarzChatWidget();
?>