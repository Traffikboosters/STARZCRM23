import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Copy, 
  Code, 
  Globe, 
  Settings, 
  CheckCircle,
  ExternalLink,
  Webhook,
  Database
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function WebsiteFormIntegration() {
  const [copied, setCopied] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    toast({
      title: "Copied to clipboard",
      description: `${type} code copied successfully`,
    });
    setTimeout(() => setCopied(null), 2000);
  };

  const htmlFormCode = `<!-- Lead Capture Form -->
<form id="leadForm" action="https://your-domain.replit.app/api/public/leads" method="POST">
  <div class="form-group">
    <label for="name">Full Name *</label>
    <input type="text" id="name" name="name" required>
  </div>
  
  <div class="form-group">
    <label for="email">Email *</label>
    <input type="email" id="email" name="email" required>
  </div>
  
  <div class="form-group">
    <label for="phone">Phone</label>
    <input type="tel" id="phone" name="phone">
  </div>
  
  <div class="form-group">
    <label for="company">Company</label>
    <input type="text" id="company" name="company">
  </div>
  
  <div class="form-group">
    <label for="position">Position</label>
    <input type="text" id="position" name="position">
  </div>
  
  <div class="form-group">
    <label for="budget">Budget</label>
    <select id="budget" name="budget">
      <option value="">Select budget range</option>
      <option value="5000">$5,000 - $10,000</option>
      <option value="10000">$10,000 - $25,000</option>
      <option value="25000">$25,000 - $50,000</option>
      <option value="50000">$50,000+</option>
    </select>
  </div>
  
  <div class="form-group">
    <label for="timeline">Timeline</label>
    <select id="timeline" name="timeline">
      <option value="">When do you need this?</option>
      <option value="immediate">Immediately</option>
      <option value="1_month">Within 1 month</option>
      <option value="3_months">Within 3 months</option>
      <option value="6_months">Within 6 months</option>
      <option value="1_year">Within 1 year</option>
    </select>
  </div>
  
  <div class="form-group">
    <label for="message">Message</label>
    <textarea id="message" name="message" rows="4"></textarea>
  </div>
  
  <input type="hidden" name="source" value="website_contact_form">
  <input type="hidden" name="formType" value="contact_form">
  
  <button type="submit">Send Inquiry</button>
</form>

<script>
document.getElementById('leadForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());
  
  try {
    const response = await fetch(this.action, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('Thank you! Your inquiry has been received and we\\'ll contact you within 1 hour.');
      this.reset();
    } else {
      alert('Error: ' + result.error);
    }
  } catch (error) {
    alert('Error submitting form. Please try again.');
  }
});
</script>`;

  const jsCode = `// JavaScript Lead Capture Function
async function captureWebsiteLead(leadData) {
  try {
    const response = await fetch('https://your-domain.replit.app/api/public/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: leadData.name,
        firstName: leadData.firstName,
        lastName: leadData.lastName,
        email: leadData.email,
        phone: leadData.phone,
        company: leadData.company,
        position: leadData.position,
        budget: leadData.budget, // in dollars
        timeline: leadData.timeline,
        message: leadData.message,
        source: leadData.source || 'website',
        formType: leadData.formType || 'contact_form',
        // Additional qualification fields
        qualification: leadData.qualification,
        authority: leadData.authority,
        need: leadData.need,
        currentSolution: leadData.currentSolution,
        competitors: leadData.competitors,
        interests: leadData.interests,
        painPoints: leadData.painPoints,
        score: leadData.score
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Lead captured successfully:', result);
      return result;
    } else {
      console.error('Error capturing lead:', result.error);
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Network error:', error);
    throw error;
  }
}

// Example usage:
// captureWebsiteLead({
//   name: 'John Doe',
//   email: 'john@example.com',
//   phone: '+1234567890',
//   company: 'Acme Corp',
//   message: 'Interested in your services',
//   source: 'pricing_page'
// });`;

  const reactCode = `import { useState } from 'react';

function LeadCaptureForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    budget: '',
    timeline: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('https://your-domain.replit.app/api/public/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          source: 'react_website',
          formType: 'contact_form'
        })
      });

      const result = await response.json();

      if (result.success) {
        alert('Thank you! Your inquiry has been received.');
        setFormData({
          name: '', email: '', phone: '', company: '',
          position: '', budget: '', timeline: '', message: ''
        });
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      alert('Error submitting form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="name"
        placeholder="Full Name *"
        value={formData.name}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded"
      />
      
      <input
        type="email"
        name="email"
        placeholder="Email *"
        value={formData.email}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded"
      />
      
      <input
        type="tel"
        name="phone"
        placeholder="Phone"
        value={formData.phone}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />
      
      <input
        type="text"
        name="company"
        placeholder="Company"
        value={formData.company}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />
      
      <textarea
        name="message"
        placeholder="How can we help you?"
        value={formData.message}
        onChange={handleChange}
        rows={4}
        className="w-full p-2 border rounded"
      />
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : 'Send Inquiry'}
      </button>
    </form>
  );
}

export default LeadCaptureForm;`;

  const wordpressCode = `<?php
// WordPress Lead Capture Function
// Add this to your theme's functions.php file

function capture_website_lead() {
    if ($_POST['action'] === 'capture_lead') {
        $lead_data = array(
            'name' => sanitize_text_field($_POST['name']),
            'email' => sanitize_email($_POST['email']),
            'phone' => sanitize_text_field($_POST['phone']),
            'company' => sanitize_text_field($_POST['company']),
            'position' => sanitize_text_field($_POST['position']),
            'budget' => intval($_POST['budget']),
            'timeline' => sanitize_text_field($_POST['timeline']),
            'message' => sanitize_textarea_field($_POST['message']),
            'source' => 'wordpress_website',
            'formType' => 'contact_form'
        );

        $response = wp_remote_post('https://your-domain.replit.app/api/public/leads', array(
            'headers' => array(
                'Content-Type' => 'application/json',
            ),
            'body' => json_encode($lead_data),
            'timeout' => 30
        ));

        if (!is_wp_error($response)) {
            $body = wp_remote_retrieve_body($response);
            $result = json_decode($body, true);
            
            if ($result['success']) {
                wp_send_json_success($result);
            } else {
                wp_send_json_error($result['error']);
            }
        } else {
            wp_send_json_error('Failed to submit lead');
        }
    }
}

add_action('wp_ajax_capture_lead', 'capture_website_lead');
add_action('wp_ajax_nopriv_capture_lead', 'capture_website_lead');

// Shortcode for lead form
function lead_capture_form_shortcode() {
    ob_start();
    ?>
    <form id="wp-lead-form" class="lead-capture-form">
        <input type="text" name="name" placeholder="Full Name *" required>
        <input type="email" name="email" placeholder="Email *" required>
        <input type="tel" name="phone" placeholder="Phone">
        <input type="text" name="company" placeholder="Company">
        <textarea name="message" placeholder="How can we help you?" rows="4"></textarea>
        <button type="submit">Send Inquiry</button>
    </form>
    
    <script>
    jQuery('#wp-lead-form').on('submit', function(e) {
        e.preventDefault();
        
        var formData = jQuery(this).serializeArray();
        formData.push({name: 'action', value: 'capture_lead'});
        
        jQuery.post('<?php echo admin_url('admin-ajax.php'); ?>', formData, function(response) {
            if (response.success) {
                alert('Thank you! Your inquiry has been received.');
                jQuery('#wp-lead-form')[0].reset();
            } else {
                alert('Error: ' + response.data);
            }
        });
    });
    </script>
    <?php
    return ob_get_clean();
}
add_shortcode('lead_capture_form', 'lead_capture_form_shortcode');
?>`;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Globe className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-semibold">Website Form Integration</h2>
        <Badge variant="outline">Active</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-4 w-4 text-green-600" />
              <span className="font-medium">Endpoint Status</span>
            </div>
            <Badge variant="outline" className="text-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Webhook className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Auto Follow-up</span>
            </div>
            <Badge variant="outline" className="text-blue-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              1 Hour Response
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="h-4 w-4 text-purple-600" />
              <span className="font-medium">Real-time Notifications</span>
            </div>
            <Badge variant="outline" className="text-purple-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              WebSocket Active
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            API Endpoint Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <p className="font-medium mb-2">Public Lead Capture Endpoint:</p>
            <div className="flex items-center gap-2">
              <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm flex-1">
                POST https://your-domain.replit.app/api/public/leads
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard("https://your-domain.replit.app/api/public/leads", "Endpoint URL")}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Key Features:</h4>
            <ul className="space-y-1 text-sm">
              <li>• No authentication required for public forms</li>
              <li>• Automatic lead scoring and prioritization</li>
              <li>• Real-time notifications to your CRM dashboard</li>
              <li>• Automatic follow-up task creation within 1 hour</li>
              <li>• Lead source tracking for analytics</li>
              <li>• Duplicate detection by email/phone</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="html" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="html">HTML Form</TabsTrigger>
          <TabsTrigger value="javascript">JavaScript</TabsTrigger>
          <TabsTrigger value="react">React Component</TabsTrigger>
          <TabsTrigger value="wordpress">WordPress</TabsTrigger>
        </TabsList>

        <TabsContent value="html" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  HTML Contact Form
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(htmlFormCode, "HTML Form")}
                >
                  {copied === "HTML Form" ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  Copy Code
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto">
                <code>{htmlFormCode}</code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="javascript" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  JavaScript Integration
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(jsCode, "JavaScript")}
                >
                  {copied === "JavaScript" ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  Copy Code
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto">
                <code>{jsCode}</code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="react" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  React Component
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(reactCode, "React Component")}
                >
                  {copied === "React Component" ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  Copy Code
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto">
                <code>{reactCode}</code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wordpress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  WordPress Integration
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(wordpressCode, "WordPress")}
                >
                  {copied === "WordPress" ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  Copy Code
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto">
                <code>{wordpressCode}</code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Form Field Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Required Fields:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <code>name</code> or <code>firstName</code> - Contact name</li>
                <li>• <code>email</code> or <code>phone</code> - Contact method</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Optional Fields:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <code>company</code> - Company name</li>
                <li>• <code>position</code> - Job title</li>
                <li>• <code>budget</code> - Budget in dollars</li>
                <li>• <code>timeline</code> - Project timeline</li>
                <li>• <code>message</code> - Inquiry details</li>
                <li>• <code>source</code> - Traffic source</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Qualification Fields:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <code>qualification</code> - Lead quality</li>
                <li>• <code>authority</code> - Decision maker level</li>
                <li>• <code>need</code> - Specific requirements</li>
                <li>• <code>score</code> - Lead score (1-100)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Timeline Options:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <code>immediate</code></li>
                <li>• <code>1_month</code></li>
                <li>• <code>3_months</code></li>
                <li>• <code>6_months</code></li>
                <li>• <code>1_year</code></li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}