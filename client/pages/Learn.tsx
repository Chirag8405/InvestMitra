import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  BookOpen, 
  Award, 
  Target, 
  Play, 
  CheckCircle, 
  Lock,
  Star,
  Trophy,
  Coins,
  TrendingUp,
  Clock,
  Brain,
  Zap
} from "lucide-react";
import { useLearning } from "@/hooks/use-learning";

export default function Learn() {
  const { 
    modules, 
    progress, 
    completeLesson, 
    submitQuiz, 
    getAvailableModules, 
    getModuleById,
    getUnlockedAchievements 
  } = useLearning();
  const { toast } = useToast();
  
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);

  const availableModules = getAvailableModules();

  const handleLessonComplete = (moduleId: string, lessonId: string) => {
    completeLesson(moduleId, lessonId);
    toast({
      title: "Lesson Completed! 🎉",
      description: "You've earned experience points. Keep learning!",
    });
  };

  const handleQuizSubmit = () => {
    if (!selectedModule || quizAnswers.length !== selectedModule.quiz.questions.length) {
      toast({
        title: "Incomplete Quiz",
        description: "Please answer all questions before submitting.",
        variant: "destructive",
      });
      return;
    }

    const result = submitQuiz(selectedModule.id, quizAnswers);
    setQuizResult(result);
    
    if (result.passed) {
      toast({
        title: "Quiz Passed! 🌟",
        description: `Great job! You scored ${result.score}% and earned ${selectedModule.reward} coins.`,
      });
    } else {
      toast({
        title: "Quiz Failed",
        description: `You scored ${result.score}%. You need 70% to pass. Try again!`,
        variant: "destructive",
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'INTERMEDIATE': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'ADVANCED': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'BASICS': return <BookOpen className="h-4 w-4" />;
      case 'ANALYSIS': return <Brain className="h-4 w-4" />;
      case 'STRATEGY': return <Target className="h-4 w-4" />;
      case 'RISK': return <Award className="h-4 w-4" />;
      case 'INDIAN_MARKETS': return <TrendingUp className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-8 w-8" />
            Learning Hub
          </h1>
          <p className="text-muted-foreground mt-1">
            Master investing with interactive tutorials and earn coins
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 flex items-center gap-1">
            <Coins className="h-3 w-3" />
            {progress.totalCoinsEarned} coins earned
          </Badge>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 flex items-center gap-1">
            <Star className="h-3 w-3" />
            Level {progress.level}
          </Badge>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Modules Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress.modulesCompleted}</div>
            <p className="text-xs text-muted-foreground">of {modules.length} total</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Quizzes Passed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress.quizzesPassed}</div>
            <p className="text-xs text-muted-foreground">70% passing grade</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Experience Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress.experiencePoints}</div>
            <p className="text-xs text-muted-foreground">Next level: {500 - (progress.experiencePoints % 500)} XP</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getUnlockedAchievements().length}</div>
            <p className="text-xs text-muted-foreground">of {progress.achievements.length} total</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="modules" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3">
          <TabsTrigger value="modules">Learning Modules</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="progress">My Progress</TabsTrigger>
        </TabsList>

        {/* Learning Modules */}
        <TabsContent value="modules">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modules.map((module) => (
              <Card key={module.id} className={`relative ${!module.unlocked ? 'opacity-60' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(module.category)}
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                      {!module.unlocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                      {module.completed && <CheckCircle className="h-4 w-4 text-success" />}
                    </div>
                    <Badge className={getDifficultyColor(module.difficulty)}>
                      {module.difficulty}
                    </Badge>
                  </div>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{module.duration} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Coins className="h-3 w-3" />
                          <span>{module.reward} coins</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round(module.progress)}%</span>
                      </div>
                      <Progress value={module.progress} className="h-2" />
                    </div>

                    {module.unlocked ? (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            className="w-full" 
                            onClick={() => setSelectedModule(module)}
                            variant={module.completed ? "outline" : "default"}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            {module.completed ? 'Review Module' : 'Start Learning'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{module.title}</DialogTitle>
                            <DialogDescription>{module.description}</DialogDescription>
                          </DialogHeader>
                          
                          {selectedModule && (
                            <div className="space-y-6">
                              {/* Lessons */}
                              <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Lessons</h3>
                                {selectedModule.lessons.map((lesson: any, index: number) => (
                                  <Card key={lesson.id} className="p-4">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <h4 className="font-medium flex items-center gap-2">
                                          {lesson.title}
                                          {lesson.completed && <CheckCircle className="h-4 w-4 text-success" />}
                                        </h4>
                                        <p className="text-sm text-muted-foreground mt-2">
                                          {lesson.content}
                                        </p>
                                      </div>
                                      {!lesson.completed && (
                                        <Button
                                          size="sm"
                                          onClick={() => handleLessonComplete(selectedModule.id, lesson.id)}
                                        >
                                          Complete
                                        </Button>
                                      )}
                                    </div>
                                  </Card>
                                ))}
                              </div>

                              {/* Quiz */}
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <h3 className="text-lg font-semibold">Quiz</h3>
                                  {selectedModule.quiz.passed && (
                                    <Badge variant="default" className="bg-success">
                                      Passed ({selectedModule.quiz.score}%)
                                    </Badge>
                                  )}
                                </div>
                                
                                {!showQuiz ? (
                                  <Card className="p-4">
                                    <div className="text-center space-y-4">
                                      <Trophy className="h-12 w-12 mx-auto text-primary" />
                                      <div>
                                        <h4 className="font-medium">Ready for the quiz?</h4>
                                        <p className="text-sm text-muted-foreground">
                                          Test your knowledge with {selectedModule.quiz.questions.length} questions. 
                                          You need 70% to pass and earn {selectedModule.reward} coins.
                                        </p>
                                      </div>
                                      <Button 
                                        onClick={() => {
                                          setShowQuiz(true);
                                          setQuizAnswers([]);
                                          setQuizResult(null);
                                        }}
                                        disabled={selectedModule.lessons.some((l: any) => !l.completed)}
                                      >
                                        <Zap className="h-4 w-4 mr-2" />
                                        Start Quiz
                                      </Button>
                                      {selectedModule.lessons.some((l: any) => !l.completed) && (
                                        <p className="text-xs text-muted-foreground">
                                          Complete all lessons first
                                        </p>
                                      )}
                                    </div>
                                  </Card>
                                ) : (
                                  <Card className="p-4">
                                    <div className="space-y-6">
                                      {selectedModule.quiz.questions.map((question: any, qIndex: number) => (
                                        <div key={question.id} className="space-y-3">
                                          <h4 className="font-medium">
                                            {qIndex + 1}. {question.question}
                                          </h4>
                                          <RadioGroup
                                            value={quizAnswers[qIndex]?.toString()}
                                            onValueChange={(value) => {
                                              const newAnswers = [...quizAnswers];
                                              newAnswers[qIndex] = parseInt(value);
                                              setQuizAnswers(newAnswers);
                                            }}
                                          >
                                            {question.options.map((option: string, oIndex: number) => (
                                              <div key={oIndex} className="flex items-center space-x-2">
                                                <RadioGroupItem value={oIndex.toString()} id={`q${qIndex}-o${oIndex}`} />
                                                <Label htmlFor={`q${qIndex}-o${oIndex}`} className="text-sm">
                                                  {option}
                                                </Label>
                                              </div>
                                            ))}
                                          </RadioGroup>
                                          
                                          {quizResult && (
                                            <div className={`p-3 rounded-lg ${
                                              quizAnswers[qIndex] === question.correctAnswer 
                                                ? 'bg-success/10 border border-success/20' 
                                                : 'bg-destructive/10 border border-destructive/20'
                                            }`}>
                                              <p className="text-sm">
                                                <strong>
                                                  {quizAnswers[qIndex] === question.correctAnswer ? 'Correct!' : 'Incorrect.'}
                                                </strong>
                                                {' '}{question.explanation}
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                      
                                      {!quizResult ? (
                                        <Button 
                                          onClick={handleQuizSubmit}
                                          className="w-full"
                                          disabled={quizAnswers.length !== selectedModule.quiz.questions.length}
                                        >
                                          Submit Quiz
                                        </Button>
                                      ) : (
                                        <div className="text-center space-y-2">
                                          <Badge 
                                            variant={quizResult.passed ? "default" : "destructive"}
                                            className="text-lg px-4 py-2"
                                          >
                                            {quizResult.passed ? 'Passed!' : 'Failed'} - {quizResult.score}%
                                          </Badge>
                                          <Button 
                                            onClick={() => {
                                              setShowQuiz(false);
                                              setQuizResult(null);
                                              setQuizAnswers([]);
                                            }}
                                            variant="outline"
                                          >
                                            {quizResult.passed ? 'Close' : 'Try Again'}
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </Card>
                                )}
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <Button disabled className="w-full">
                        <Lock className="h-4 w-4 mr-2" />
                        Locked
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Achievements */}
        <TabsContent value="achievements">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {progress.achievements.map((achievement) => (
              <Card key={achievement.id} className={`${achievement.unlocked ? 'bg-accent/50' : 'opacity-60'}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {achievement.title}
                        {achievement.unlocked && <CheckCircle className="h-4 w-4 text-success" />}
                      </CardTitle>
                      <CardDescription>{achievement.description}</CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                      +{achievement.reward}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{achievement.progress}/{achievement.target}</span>
                    </div>
                    <Progress value={(achievement.progress / achievement.target) * 100} className="h-2" />
                    {achievement.unlocked && achievement.unlockedAt && (
                      <p className="text-xs text-muted-foreground">
                        Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Progress */}
        <TabsContent value="progress">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Learning Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-accent/50 rounded-lg">
                    <div className="text-2xl font-bold">{progress.level}</div>
                    <p className="text-sm text-muted-foreground">Current Level</p>
                  </div>
                  <div className="text-center p-4 bg-accent/50 rounded-lg">
                    <div className="text-2xl font-bold">{progress.experiencePoints}</div>
                    <p className="text-sm text-muted-foreground">Total XP</p>
                  </div>
                  <div className="text-center p-4 bg-accent/50 rounded-lg">
                    <div className="text-2xl font-bold">{progress.totalCoinsEarned}</div>
                    <p className="text-sm text-muted-foreground">Coins Earned</p>
                  </div>
                  <div className="text-center p-4 bg-accent/50 rounded-lg">
                    <div className="text-2xl font-bold">{Math.round((progress.modulesCompleted / modules.length) * 100)}%</div>
                    <p className="text-sm text-muted-foreground">Completion</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getUnlockedAchievements()
                    .sort((a, b) => (b.unlockedAt || 0) - (a.unlockedAt || 0))
                    .slice(0, 5)
                    .map((achievement) => (
                      <div key={achievement.id} className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
                        <div className="text-xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-medium">{achievement.title}</h4>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        </div>
                        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                          +{achievement.reward}
                        </Badge>
                      </div>
                    ))}
                  {getUnlockedAchievements().length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Complete lessons and quizzes to unlock achievements!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
