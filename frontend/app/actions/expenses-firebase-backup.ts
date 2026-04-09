    // Auto-generate description based on category and available data
    const generateDescription = (): string => {
      switch (category) {
        case 'salary_wages':
          const empName = formData.get('employee_name') as string
          const salaryMonth = formData.get('salary_month') as string
          if (empName?.trim() && salaryMonth?.trim()) {
            return `Salary for ${empName} - ${salaryMonth}`
          } else if (empName?.trim()) {
            return `Salary payment for ${empName}`
          }
          return 'Salary payment'

        case 'attendance':
          const bonusEmp = formData.get('employee_name') as string
          const bonusType = formData.get('bonus_type') as string
          if (bonusEmp?.trim() && bonusType?.trim()) {
            return `${bonusType} bonus for ${bonusEmp}`
          } else if (bonusEmp?.trim()) {
            return `Bonus payment for ${bonusEmp}`
          }
          return 'Attendance/Bonus payment'

        case 'subscriptions':
          const serviceName = formData.get('service_name') as string
          const provider = formData.get('service_provider') as string
          if (serviceName?.trim()) {
            return `${serviceName} subscription`
          } else if (provider?.trim()) {
            return `Subscription payment to ${provider}`
          }
          return 'Service subscription'

        case 'office_supplies':
          const items = formData.get('items') as string
          if (items?.trim()) {
            // Truncate if too long
            const itemList = items.length > 50 ? items.substring(0, 50) + '...' : items
            return `Office supplies: ${itemList}`
          }
          return 'Office supplies purchase'

        case 'office_maintenance':
          const serviceType = formData.get('service_type') as string
          if (serviceType?.trim()) {
            return `${serviceType} maintenance`
          }
          return 'Office maintenance'

        case 'wifi_internet':
          const providerName = formData.get('provider_name') as string
          if (providerName?.trim()) {
            return `Internet service - ${providerName}`
          }
          return 'WiFi/Internet service'

        case 'utilities':
          const utilityType = formData.get('utility_type') as string
          if (utilityType?.trim()) {
            return `${utilityType} utility bill`
          }
          return 'Utilities payment'

        case 'rent':
          const landlord = formData.get('landlord_name') as string
          const address = formData.get('property_address') as string
          if (landlord?.trim() && address?.trim()) {
            return `Rent payment to ${landlord}`
          } else if (landlord?.trim()) {
            return `Rent payment to ${landlord}`
          }
          return 'Rent/Lease payment'

        default:
          return `${category.replace('_', ' ')} expense`
      }
    }

    const description = generateDescription()