export interface DiseaseDetectionResult {
  disease: string;
  confidence: number;
  description: string;
  treatment: string;
  prevention: string;
}

export class DiseaseDetector {
  private readonly HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/';
  private readonly PLANT_DISEASE_MODEL = 'microsoft/DialoGPT-medium'; // Using DialoGPT as fallback since plant disease models require specific setup

  async detectDisease(): Promise<DiseaseDetectionResult> {
    try {
      // For demo purposes, we'll use a mock detection based on filename
      // In production, you'd integrate with actual plant disease detection APIs
      const mockResult = await this.mockDetection();

      // Uncomment below for actual Hugging Face integration
      // const result = await this.callHuggingFaceAPI(imageFile);
      // return this.parseHuggingFaceResponse(result);

      return mockResult;
    } catch (error) {
      console.error('Disease detection error:', error);
      return {
        disease: 'Unable to detect',
        confidence: 0,
        description: 'Could not analyze the image. Please try again.',
        treatment: 'Consult a local agricultural expert.',
        prevention: 'Regular monitoring and proper plant care.'
      };
    }
  }

  private async mockDetection(): Promise<DiseaseDetectionResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock detection based on common plant diseases
    const diseases = [
      {
        disease: 'Leaf Spot Disease',
        confidence: 0.85,
        description: 'Fungal infection causing dark spots on leaves.',
        treatment: 'Apply copper-based fungicide. Remove affected leaves.',
        prevention: 'Ensure good air circulation. Avoid overhead watering.'
      },
      {
        disease: 'Powdery Mildew',
        confidence: 0.78,
        description: 'White powdery coating on leaves and stems.',
        treatment: 'Use sulfur-based fungicide. Improve air circulation.',
        prevention: 'Plant resistant varieties. Avoid high humidity.'
      },
      {
        disease: 'Bacterial Blight',
        confidence: 0.92,
        description: 'Water-soaked lesions that turn brown and dry.',
        treatment: 'Apply copper fungicide. Remove infected plant parts.',
        prevention: 'Use disease-free seeds. Rotate crops annually.'
      },
      {
        disease: 'Healthy Plant',
        confidence: 0.95,
        description: 'No visible signs of disease detected.',
        treatment: 'Continue regular care and monitoring.',
        prevention: 'Maintain proper nutrition and watering schedule.'
      }
    ];

    // Random selection for demo
    const randomIndex = Math.floor(Math.random() * diseases.length);
    return diseases[randomIndex];
  }

  private async callHuggingFaceAPI(): Promise<Record<string, unknown>> {
    const apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
    if (!apiKey) {
      throw new Error('Hugging Face API key not configured');
    }

    const formData = new FormData();
    // formData.append('file', imageFile);

    const response = await fetch(`${this.HUGGINGFACE_API_URL}${this.PLANT_DISEASE_MODEL}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    return await response.json();
  }

  private parseHuggingFaceResponse(_response: Record<string, unknown>): DiseaseDetectionResult {
    // This would need to be adapted based on the actual model's response format
    // For now, return a mock result
    return {
      disease: 'Analysis Complete',
      confidence: 0.8,
      description: 'Plant health analysis completed.',
      treatment: 'Follow standard agricultural practices.',
      prevention: 'Regular monitoring and proper care.'
    };
  }

  async getDiseaseInfo(diseaseName: string): Promise<DiseaseDetectionResult | null> {
    // Mock disease database
    const diseaseDatabase: { [key: string]: DiseaseDetectionResult } = {
      'leaf spot': {
        disease: 'Leaf Spot Disease',
        confidence: 1.0,
        description: 'Fungal disease causing circular spots on leaves.',
        treatment: 'Apply fungicide and remove affected leaves.',
        prevention: 'Improve air circulation and avoid wet foliage.'
      },
      'powdery mildew': {
        disease: 'Powdery Mildew',
        confidence: 1.0,
        description: 'Fungal disease with white powdery growth.',
        treatment: 'Use sulfur sprays and improve ventilation.',
        prevention: 'Avoid overhead watering and plant spacing.'
      },
      'blight': {
        disease: 'Late Blight',
        confidence: 1.0,
        description: 'Serious disease affecting potatoes and tomatoes.',
        treatment: 'Remove infected plants and apply fungicide.',
        prevention: 'Use certified seeds and crop rotation.'
      }
    };

    return diseaseDatabase[diseaseName.toLowerCase()] || null;
  }
}

export const diseaseDetector = new DiseaseDetector();
