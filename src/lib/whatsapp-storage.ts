// Sistema de armazenamento local de WhatsApp para remarketing
// Armazena dados no localStorage do navegador

export interface WhatsAppContact {
  id: string
  name: string
  email: string
  whatsapp: string
  createdAt: string
}

const STORAGE_KEY = 'whatsapp_contacts'

export function saveWhatsAppContact(contact: WhatsAppContact): void {
  try {
    const contacts = getWhatsAppContacts()
    
    // Verificar se já existe (evitar duplicatas)
    const existingIndex = contacts.findIndex(c => c.email === contact.email)
    
    if (existingIndex >= 0) {
      // Atualizar contato existente
      contacts[existingIndex] = contact
    } else {
      // Adicionar novo contato
      contacts.push(contact)
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts))
    console.log('✅ WhatsApp salvo localmente:', contact.whatsapp)
  } catch (error) {
    console.error('❌ Erro ao salvar WhatsApp:', error)
  }
}

export function getWhatsAppContacts(): WhatsAppContact[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('❌ Erro ao carregar contatos:', error)
    return []
  }
}

export function exportWhatsAppContacts(): string {
  const contacts = getWhatsAppContacts()
  
  // Criar CSV
  const headers = 'Nome,Email,WhatsApp,Data de Cadastro\n'
  const rows = contacts.map(c => 
    `"${c.name}","${c.email}","${c.whatsapp}","${c.createdAt}"`
  ).join('\n')
  
  return headers + rows
}

export function downloadWhatsAppCSV(): void {
  const csv = exportWhatsAppContacts()
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `whatsapp-contacts-${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function getWhatsAppCount(): number {
  return getWhatsAppContacts().length
}
