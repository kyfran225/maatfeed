import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  User, 
  Video, 
  Mic, 
  FileText,
  Settings,
  Star,
  Users,
  TrendingUp,
  Award,
  Camera,
  Globe,
  MessageCircle,
  ArrowRight
} from "lucide-react";
import { SEO } from "../../components/SEO";
import { Button } from "../../components/ui/Button";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { useAuth } from "../../hooks/useAuth";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  component: React.ComponentType<{ onNext: () => void; onBack?: () => void; data: any; updateData: (data: any) => void }>;
}

interface OnboardingData {
  displayName: string;
  bio: string;
  avatar?: string;
  coverImage?: string;
  socialLinks: {
    website?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    linkedin?: string;
  };
  contentInterests: string[];
  contentTypes: string[];
  postingSchedule: {
    frequency: string;
    bestDays: string[];
    bestTimes: string[];
  };
  goals: string[];
  preferences: {
    allowComments: boolean;
    allowCollaboration: boolean;
    contentVisibility: string;
    notifications: {
      newFollowers: boolean;
      comments: boolean;
      mentions: boolean;
      analytics: boolean;
    };
  };
}

const CONTENT_TYPES = [
  { id: "video", label: "Video", icon: Video, description: "Educational videos, tutorials, discussions" },
  { id: "audio", label: "Audio", icon: Mic, description: "Podcasts, music, spoken word" },
  { id: "debate", label: "Debates", icon: MessageCircle, description: "Host discussions and debates" },
  { id: "article", label: "Articles", icon: FileText, description: "Written content and analysis" }
];

const CONTENT_INTERESTS = [
  { id: "philosophy", label: "African Philosophy", icon: Star },
  { id: "history", label: "History", icon: Award },
  { id: "culture", label: "Culture", icon: Users },
  { id: "education", label: "Education", icon: TrendingUp },
  { id: "spirituality", label: "Spirituality", icon: Globe },
  { id: "debate", label: "Debates", icon: MessageCircle },
  { id: "wellness", label: "Wellness", icon: Star },
  { id: "science", label: "Science", icon: TrendingUp }
];

const CREATOR_GOALS = [
  { id: "educate", label: "Educate and share knowledge", description: "Help others learn about African culture and knowledge" },
  { id: "build-community", label: "Build a community", description: "Create a space for meaningful discussions" },
  { id: "monetize", label: "Monetize content", description: "Generate income from your creations" },
  { id: "influence", label: "Become an influencer", description: "Establish yourself as a thought leader" },
  { id: "collaborate", label: "Collaborate with others", description: "Work with other creators and experts" }
];

// Step Components
function BasicInfoStep({ onNext, data, updateData }: any) {
  const [displayName, setDisplayName] = useState(data.displayName || "");
  const [bio, setBio] = useState(data.bio || "");

  const handleSubmit = () => {
    if (!displayName.trim() || !bio.trim()) {
      alert("Please fill in all required fields");
      return;
    }
    updateData({ displayName, bio });
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <User className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Basic Information</h2>
        <p className="text-gray-400">Tell us about yourself and what you do</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Display Name *</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none"
            placeholder="Enter your creator name"
            maxLength={100}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Bio *</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none resize-none"
            placeholder="Tell your audience about yourself and your content..."
            rows={4}
            maxLength={500}
          />
          <div className="text-right text-xs text-gray-400 mt-1">
            {bio.length}/500
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <div></div>
        <Button onClick={handleSubmit} className="flex items-center gap-2">
          Continue
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}

function ContentFocusStep({ onNext, onBack, data, updateData }: any) {
  const [selectedTypes, setSelectedTypes] = useState(data.contentTypes || []);
  const [selectedInterests, setSelectedInterests] = useState(data.contentInterests || []);

  const handleSubmit = () => {
    if (selectedTypes.length === 0 || selectedInterests.length === 0) {
      alert("Please select at least one content type and one interest");
      return;
    }
    updateData({ contentTypes: selectedTypes, contentInterests: selectedInterests });
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <Video className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Content Focus</h2>
        <p className="text-gray-400">What type of content will you create?</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Content Types</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CONTENT_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => {
                setSelectedTypes(prev => 
                  prev.includes(type.id) 
                    ? prev.filter(t => t !== type.id)
                    : [...prev, type.id]
                );
              }}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedTypes.includes(type.id)
                  ? "border-orange-500 bg-orange-500/10"
                  : "border-gray-700 hover:border-gray-600"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <type.icon className="w-6 h-6 text-orange-400" />
                <span className="font-medium">{type.label}</span>
              </div>
              <p className="text-sm text-gray-400">{type.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Content Interests</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {CONTENT_INTERESTS.map((interest) => (
            <button
              key={interest.id}
              onClick={() => {
                setSelectedInterests(prev => 
                  prev.includes(interest.id) 
                    ? prev.filter(i => i !== interest.id)
                    : [...prev, interest.id]
                );
              }}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedInterests.includes(interest.id)
                  ? "border-orange-500 bg-orange-500/10"
                  : "border-gray-700 hover:border-gray-600"
              }`}
            >
              <interest.icon className="w-5 h-5 text-orange-400 mx-auto mb-1" />
              <span className="text-xs">{interest.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack} className="flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        <Button onClick={handleSubmit} className="flex items-center gap-2">
          Continue
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}

function GoalsStep({ onNext, onBack, data, updateData }: any) {
  const [selectedGoals, setSelectedGoals] = useState(data.goals || []);

  const handleSubmit = () => {
    if (selectedGoals.length === 0) {
      alert("Please select at least one goal");
      return;
    }
    updateData({ goals: selectedGoals });
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <Star className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Your Goals</h2>
        <p className="text-gray-400">What do you want to achieve as a creator?</p>
      </div>

      <div className="space-y-3">
        {CREATOR_GOALS.map((goal) => (
          <button
            key={goal.id}
            onClick={() => {
              setSelectedGoals(prev => 
                prev.includes(goal.id) 
                  ? prev.filter(g => g !== goal.id)
                  : [...prev, goal.id]
              );
            }}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
              selectedGoals.includes(goal.id)
                ? "border-orange-500 bg-orange-500/10"
                : "border-gray-700 hover:border-gray-600"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                selectedGoals.includes(goal.id)
                  ? "border-orange-500 bg-orange-500"
                  : "border-gray-600"
              }`}>
                {selectedGoals.includes(goal.id) && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </div>
              <div>
                <h4 className="font-medium mb-1">{goal.label}</h4>
                <p className="text-sm text-gray-400">{goal.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack} className="flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        <Button onClick={handleSubmit} className="flex items-center gap-2">
          Continue
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}

function PreferencesStep({ onNext, onBack, data, updateData }: any) {
  const [preferences, setPreferences] = useState(data.preferences || {
    allowComments: true,
    allowCollaboration: true,
    contentVisibility: "public",
    notifications: {
      newFollowers: true,
      comments: true,
      mentions: true,
      analytics: true
    }
  });

  const handleSubmit = () => {
    updateData({ preferences });
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <Settings className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Preferences</h2>
        <p className="text-gray-400">Customize your creator experience</p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Content Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Allow Comments</h4>
                <p className="text-sm text-gray-400">Let viewers comment on your content</p>
              </div>
              <button
                onClick={() => setPreferences(prev => ({
                  ...prev,
                  allowComments: !prev.allowComments
                }))}
                className={`w-12 h-6 rounded-full transition-colors ${
                  preferences.allowComments ? "bg-orange-500" : "bg-gray-700"
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  preferences.allowComments ? "translate-x-6" : "translate-x-0.5"
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Allow Collaboration</h4>
                <p className="text-sm text-gray-400">Let other creators collaborate with you</p>
              </div>
              <button
                onClick={() => setPreferences(prev => ({
                  ...prev,
                  allowCollaboration: !prev.allowCollaboration
                }))}
                className={`w-12 h-6 rounded-full transition-colors ${
                  preferences.allowCollaboration ? "bg-orange-500" : "bg-gray-700"
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  preferences.allowCollaboration ? "translate-x-6" : "translate-x-0.5"
                }`} />
              </button>
            </div>

            <div>
              <h4 className="font-medium mb-2">Content Visibility</h4>
              <select
                value={preferences.contentVisibility}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  contentVisibility: e.target.value
                }))}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white"
              >
                <option value="public">Public - Everyone can see</option>
                <option value="followers">Followers only</option>
                <option value="private">Private - Only you</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Notifications</h3>
          <div className="space-y-4">
            {Object.entries(preferences.notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </h4>
                  <p className="text-sm text-gray-400">
                    {key === 'newFollowers' && "Get notified when someone follows you"}
                    {key === 'comments' && "Get notified of new comments"}
                    {key === 'mentions' && "Get notified when you're mentioned"}
                    {key === 'analytics' && "Get weekly analytics reports"}
                  </p>
                </div>
                <button
                  onClick={() => setPreferences(prev => ({
                    ...prev,
                    notifications: {
                      ...prev.notifications,
                      [key]: !prev.notifications[key as keyof typeof prev.notifications]
                    }
                  }))}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    value ? "bg-orange-500" : "bg-gray-700"
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    value ? "translate-x-6" : "translate-x-0.5"
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack} className="flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        <Button onClick={handleSubmit} className="flex items-center gap-2">
          Continue
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}

function CompletionStep({ onNext, onBack, data }: any) {
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Create creator profile
      const response = await fetch('/api/creator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        onNext();
      } else {
        throw new Error('Failed to create creator profile');
      }
    } catch (error) {
      console.error('Error creating creator profile:', error);
      alert('Failed to create creator profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <Award className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Ready to Go!</h2>
        <p className="text-gray-400">Review your information and complete setup</p>
      </div>

      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold mb-4">Creator Profile Summary</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-1">Display Name</h4>
            <p className="text-white">{data.displayName}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-1">Bio</h4>
            <p className="text-white">{data.bio}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-1">Content Types</h4>
            <div className="flex flex-wrap gap-2">
              {data.contentTypes?.map((type: string) => (
                <span key={type} className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm">
                  {type}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-1">Interests</h4>
            <div className="flex flex-wrap gap-2">
              {data.contentInterests?.map((interest: string) => (
                <span key={interest} className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">
                  {interest}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-1">Goals</h4>
            <div className="flex flex-wrap gap-2">
              {data.goals?.map((goal: string) => (
                <span key={goal} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                  {goal}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
        <p className="text-sm text-orange-400">
          🎉 Congratulations! You're about to join a community of creators sharing African knowledge and culture with the world.
        </p>
      </div>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack} className="flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        <Button onClick={handleComplete} disabled={loading} className="flex items-center gap-2">
          {loading ? (
            <>
              <LoadingSpinner size="sm" />
              Creating Profile...
            </>
          ) : (
            <>
              Complete Setup
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}

function SuccessStep({ data }: any) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <Check className="w-10 h-10 text-white" />
      </div>
      
      <h2 className="text-3xl font-bold mb-2">Welcome to MAATFEED!</h2>
      <p className="text-gray-400 mb-8">
        Your creator profile has been successfully created. You're ready to start sharing your content with the world.
      </p>

      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-left">
        <h3 className="text-lg font-semibold mb-4">What's Next?</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-sm font-bold">1</div>
            <span>Upload your first piece of content</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-sm font-bold">2</div>
            <span>Share your profile with your audience</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-sm font-bold">3</div>
            <span>Engage with your growing community</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={() => navigate('/creator/dashboard')} className="flex items-center gap-2">
          Go to Dashboard
          <ArrowRight className="w-4 h-4" />
        </Button>
        <Button variant="secondary" onClick={() => navigate('/upload')}>
          Upload Content
        </Button>
      </div>
    </motion.div>
  );
}

export default function CreatorOnboarding() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    displayName: "",
    bio: "",
    socialLinks: {},
    contentInterests: [],
    contentTypes: [],
    postingSchedule: {
      frequency: "weekly",
      bestDays: [],
      bestTimes: []
    },
    goals: [],
    preferences: {
      allowComments: true,
      allowCollaboration: true,
      contentVisibility: "public",
      notifications: {
        newFollowers: true,
        comments: true,
        mentions: true,
        analytics: true
      }
    }
  });

  const steps: OnboardingStep[] = [
    {
      id: "basic-info",
      title: "Basic Information",
      description: "Tell us about yourself",
      icon: User,
      component: BasicInfoStep
    },
    {
      id: "content-focus",
      title: "Content Focus",
      description: "What will you create?",
      icon: Video,
      component: ContentFocusStep
    },
    {
      id: "goals",
      title: "Your Goals",
      description: "What do you want to achieve?",
      icon: Star,
      component: GoalsStep
    },
    {
      id: "preferences",
      title: "Preferences",
      description: "Customize your experience",
      icon: Settings,
      component: PreferencesStep
    },
    {
      id: "completion",
      title: "Complete Setup",
      description: "Review and create your profile",
      icon: Award,
      component: CompletionStep
    },
    {
      id: "success",
      title: "Welcome!",
      description: "You're all set",
      icon: Check,
      component: SuccessStep
    }
  ];

  const updateData = (newData: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...newData }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  if (!profile) {
    navigate('/auth/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <SEO 
        title="Creator Onboarding - MAATFEED"
        description="Set up your creator profile and start sharing your content"
      />

      <div className="container mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-2">
              {steps.slice(0, -1).map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      index <= currentStep
                        ? "bg-orange-500 text-white"
                        : "bg-gray-800 text-gray-400"
                    }`}
                  >
                    {index < currentStep ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  {index < steps.slice(0, -1).length - 1 && (
                    <div
                      className={`w-8 h-0.5 mx-2 transition-colors ${
                        index < currentStep ? "bg-orange-500" : "bg-gray-800"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold">{steps[currentStep].title}</h1>
            <p className="text-gray-400">{steps[currentStep].description}</p>
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            <CurrentStepComponent
              key={currentStep}
              onNext={handleNext}
              onBack={handleBack}
              data={onboardingData}
              updateData={updateData}
            />
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
