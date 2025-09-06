// integrations.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Integration {
  id: string;
  name: string;
  logo: string;
  category: string;
  isActive?: boolean;
  comingSoon?: boolean;
}

@Component({
  selector: 'app-integrations',
  standalone: true,
  imports: [CommonModule],
templateUrl: './integrations.component.html',
  styleUrl: './integrations.component.scss'
})
export class IntegrationsComponent {
  integrations: Integration[] = [
    {
      id: 'zendesk',
      name: 'Zendesk',
      logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTIwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiIGZpbGw9IiMwMzM2M0QiLz48cGF0aCBkPSJNMTAgMTBIMzBWMzBIMTBaIiBmaWxsPSIjRkZGIi8+PHRleHQgeD0iNDAiIHk9IjI1IiBmaWxsPSIjRkZGIiBmb250LXNpemU9IjE0IiBmb250LWZhbWlseT0iQXJpYWwiPnplbmRlc2s8L3RleHQ+PC9zdmc+',
      category: 'support'
    },
    {
      id: 'hubspot',
      name: 'HubSpot',
      logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTIwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiIGZpbGw9IiNGRjdBNTkiLz48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSI4IiBmaWxsPSIjRkZGIi8+PHRleHQgeD0iMzUiIHk9IjI1IiBmaWxsPSIjRkZGIiBmb250LXNpemU9IjE0IiBmb250LWZhbWlseT0iQXJpYWwiPkh1YlNwb3Q8L3RleHQ+PC9zdmc+',
      category: 'crm'
    },
    {
      id: 'google-sheets',
      name: 'Google Sheets',
      logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTIwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiIGZpbGw9IiMwRjlENTgiLz48cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iI0ZGRiIvPjx0ZXh0IHg9IjM1IiB5PSIyNSIgZmlsbD0iI0ZGRiIgZm9udC1zaXplPSIxMiIgZm9udC1mYW1pbHk9IkFyaWFsIj5Hb29nbGUgU2hlZXRzPC90ZXh0Pjwvc3ZnPg==',
      category: 'productivity'
    },
    {
      id: 'zoho',
      name: 'Zoho',
      logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTIwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiIGZpbGw9IiNEQzM5MjciLz48dGV4dCB4PSIyMCIgeT0iMjUiIGZpbGw9IiNGRkYiIGZvbnQtc2l6ZT0iMTgiIGZvbnQtZmFtaWx5PSJBcmlhbCI+Wk9ITzwvdGV4dD48L3N2Zz4=',
      category: 'crm'
    },
    {
      id: 'airtable',
      name: 'Airtable',
      logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTIwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiIGZpbGw9IiNGRkJGMDAiLz48cGF0aCBkPSJNMTAgMTBMMjAgNUwzMCAxMEwyMCAyNVoiIGZpbGw9IiNGRkYiLz48dGV4dCB4PSIzNSIgeT0iMjUiIGZpbGw9IiMwMDAiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtZmFtaWx5PSJBcmlhbCI+QWlydGFibGU8L3RleHQ+PC9zdmc+',
      category: 'database'
    },
    {
      id: 'automizely',
      name: 'Automizely',
      logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTIwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiIGZpbGw9IiNGRjZBMDAiLz48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxMCIgZmlsbD0iI0ZGRiIvPjx0ZXh0IHg9IjM1IiB5PSIyNSIgZmlsbD0iI0ZGRiIgZm9udC1zaXplPSIxMiIgZm9udC1mYW1pbHk9IkFyaWFsIj5hdXRvbWl6ZWx5PC90ZXh0Pjwvc3ZnPg==',
      category: 'marketing'
    },
    {
      id: 'campaign-monitor',
      name: 'Campaign Monitor',
      logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTIwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiIGZpbGw9IiMyNDI0MjQiLz48cmVjdCB4PSIxMCIgeT0iMTUiIHdpZHRoPSIyMCIgaGVpZ2h0PSIxMCIgZmlsbD0iI0ZGRiIvPjx0ZXh0IHg9IjM1IiB5PSIyNSIgZmlsbD0iI0ZGRiIgZm9udC1zaXplPSIxMCIgZm9udC1mYW1pbHk9IkFyaWFsIj5DYW1wYWlnbiBNb25pdG9yPC90ZXh0Pjwvc3ZnPg==',
      category: 'email-marketing'
    },
    {
      id: 'salesmate',
      name: 'Salesmate',
      logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTIwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiIGZpbGw9IiMwMDk2RkYiLz48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSI4IiBmaWxsPSIjRkZGIi8+PHRleHQgeD0iMzUiIHk9IjI1IiBmaWxsPSIjRkZGIiBmb250LXNpemU9IjEyIiBmb250LWZhbWlseT0iQXJpYWwiPlNhbGVzbWF0ZTwvdGV4dD48L3N2Zz4=',
      category: 'crm'
    },
    {
      id: 'activecampaign',
      name: 'ActiveCampaign',
      logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTIwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiIGZpbGw9IiMzNjc0RkYiLz48cGF0aCBkPSJNMTUgMTBMMjUgMTVMMTUgMjBMMjAgMjVMMzAgMTVaIiBmaWxsPSIjRkZGIi8+PHRleHQgeD0iMzUiIHk9IjI1IiBmaWxsPSIjRkZGIiBmb250LXNpemU9IjEwIiBmb250LWZhbWlseT0iQXJpYWwiPkFjdGl2ZUNhbXBhaWduPC90ZXh0Pjwvc3ZnPg==',
      category: 'email-marketing',
      isActive: true
    },
    {
      id: 'shopify',
      name: 'Shopify',
      logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTIwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiIGZpbGw9IiM5NkJGNDgiLz48cGF0aCBkPSJNMTAgMTBMMjUgMTJMMzAgMjBMMjAgMjVMMTAgMjBaIiBmaWxsPSIjRkZGIi8+PHRleHQgeD0iNDAiIHk9IjI1IiBmaWxsPSIjRkZGIiBmb250LXNpemU9IjE0IiBmb250LWZhbWlseT0iQXJpYWwiPnNob3BpZnk8L3RleHQ+PC9zdmc+',
      category: 'ecommerce'
    },
    {
      id: 'convertkit',
      name: 'ConvertKit',
      logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTIwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiIGZpbGw9IiNGQjdCNTYiLz48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxMCIgZmlsbD0iI0ZGRiIvPjx0ZXh0IHg9IjM1IiB5PSIyNSIgZmlsbD0iI0ZGRiIgZm9udC1zaXplPSIxMiIgZm9udC1mYW1pbHk9IkFyaWFsIj5Db252ZXJ0S2l0PC90ZXh0Pjwvc3ZnPg==',
      category: 'email-marketing'
    },
    {
      id: 'ifttt',
      name: 'IFTTT',
      logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTIwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiIGZpbGw9IiMzM0M3RkYiLz48cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSI1IiBoZWlnaHQ9IjIwIiBmaWxsPSIjRkZGIi8+PHJlY3QgeD0iMjAiIHk9IjEwIiB3aWR0aD0iNSIgaGVpZ2h0PSIyMCIgZmlsbD0iI0ZGOUEwMCIvPjx0ZXh0IHg9IjMwIiB5PSIyNSIgZmlsbD0iI0ZGRiIgZm9udC1zaXplPSIxNCIgZm9udC1mYW1pbHk9IkFyaWFsIj5JRlRUVDwvdGV4dD48L3N2Zz4=',
      category: 'automation'
    },
    {
      id: 'marketo',
      name: 'Marketo',
      logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTIwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiIGZpbGw9IiM1QzJEOTEiLz48cGF0aCBkPSJNMTAgMTBMMTUgMTVMMjAgMTBMMjUgMTVMMzAgMTBMMjUgMjVMMjAgMTVMMTUgMjVMMTAgMTVaIiBmaWxsPSIjRkZGIi8+PHRleHQgeD0iMzUiIHk9IjI1IiBmaWxsPSIjRkZGIiBmb250LXNpemU9IjEyIiBmb250LWZhbWlseT0iQXJpYWwiPk1hcmtldG88L3RleHQ+PC9zdmc+',
      category: 'marketing'
    },
    {
      id: 'integrately',
      name: 'Integrately',
      logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTIwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiIGZpbGw9IiNGRkE1MDAiLz48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSI4IiBmaWxsPSIjRkZGIi8+PHRleHQgeD0iMzUiIHk9IjI1IiBmaWxsPSIjRkZGIiBmb250LXNpemU9IjEyIiBmb250LWZhbWlseT0iQXJpYWwiPmludGVncmF0ZWx5PC90ZXh0Pjwvc3ZnPg==',
      category: 'automation'
    },
    {
      id: 'pabbly',
      name: 'Pabbly Connect',
      logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTIwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiIGZpbGw9IiMwMEQ4RkYiLz48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxMCIgZmlsbD0iI0ZGRiIvPjx0ZXh0IHg9IjM1IiB5PSIyNSIgZmlsbD0iI0ZGRiIgZm9udC1zaXplPSIxMiIgZm9udC1mYW1pbHk9IkFyaWFsIj5QYWJibHk8L3RleHQ+PC9zdmc+',
      category: 'automation'
    },
    {
      id: 'zapier',
      name: 'Zapier',
      logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTIwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiIGZpbGw9IiNGRjQ5MDAiLz48cGF0aCBkPSJNMTAgMTVMMjAgMTBMMzAgMTVMMjAgMjVaIiBmaWxsPSIjRkZGIi8+PHRleHQgeD0iMzUiIHk9IjI1IiBmaWxsPSIjRkZGIiBmb250LXNpemU9IjE0IiBmb250LWZhbWlseT0iQXJpYWwiPnphcGllcjwvdGV4dD48L3N2Zz4=',
      category: 'automation'
    },
    {
      id: 'syncspider',
      name: 'SyncSpider',
      logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTIwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiIGZpbGw9IiMwMDAwMDAiLz48cGF0aCBkPSJNMjAgMjBMMTUgMTVMMjAgMTBMMjUgMTVMMzAgMjBMMjUgMjVMMjAgMzBMMTUgMjVaIiBmaWxsPSIjRkZGIi8+PHRleHQgeD0iMzUiIHk9IjI1IiBmaWxsPSIjRkZGIiBmb250LXNpemU9IjEwIiBmb250LWZhbWlseT0iQXJpYWwiPnN5bmNzcGlkZXI8L3RleHQ+PC9zdmc+',
      category: 'data-sync'
    },
    {
      id: 'sendfox',
      name: 'SendFox',
      logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTIwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiIGZpbGw9IiNGRjY5MzMiLz48cGF0aCBkPSJNMTAgMTVMMjAgMTBMMzAgMTVMMjUgMjBMMzAgMjVMMjAgMzBMMTAgMjVMMTUgMjBaIiBmaWxsPSIjRkZGIi8+PHRleHQgeD0iMzUiIHk9IjI1IiBmaWxsPSIjRkZGIiBmb250LXNpemU9IjEyIiBmb250LWZhbWlseT0iQXJpYWwiPlNlbmRGb3g8L3RleHQ+PC9zdmc+',
      category: 'email-marketing'
    },
    {
      id: 'integromat',
      name: 'Integromat',
      logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTIwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiIGZpbGw9IiMwMDk2RkYiLz48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSI4IiBmaWxsPSIjRkZGIi8+PHRleHQgeD0iMzUiIHk9IjI1IiBmaWxsPSIjRkZGIiBmb250LXNpemU9IjEwIiBmb250LWZhbWlseT0iQXJpYWwiPmludGVncm9tYXQ8L3RleHQ+PC9zdmc+',
      category: 'automation'
    }
  ];

  trackByIntegration(index: number, integration: Integration): string {
    return integration.id;
  }

  toggleBotDropdown(): void {
    console.log('Bot dropdown toggled');
    // Implement dropdown functionality
  }

  onIntegrationClick(integration: Integration): void {
    if (integration.comingSoon) {
      console.log(`${integration.name} is coming soon!`);
      return;
    }

    console.log(`Configuring ${integration.name} integration...`);
    // Navigate to integration configuration page
    // Example: this.router.navigate(['/integrations', integration.id]);
  }

  onImageError(event: any): void {
    // Fallback when image fails to load
    event.target.style.display = 'none';
    event.target.parentElement.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 180px;
        height: 60px;
        background: #f8f9fa;
        border-radius: 8px;
        color: #6c757d;
        font-size: 14px;
        font-weight: 500;
      ">
        ${event.target.alt}
      </div>
    `;
  }
}

interface Integration {
  id: string;
  name: string;
  logo: string;
  category: string;
  isActive?: boolean;
  comingSoon?: boolean;
}