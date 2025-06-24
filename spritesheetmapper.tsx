import React, { useState, useRef, useEffect } from 'react';
import { Download, Grid, Play, Square, Upload } from 'lucide-react';

const SpritesheetMapper = () => {
  const [spritesheet, setSpritesheet] = useState(null);
  const [sprites, setSprites] = useState([]);
  const [gridWidth, setGridWidth] = useState(4);
  const [gridHeight, setGridHeight] = useState(3);
  const [spriteWidth, setSpriteWidth] = useState(32);
  const [spriteHeight, setSpriteHeight] = useState(32);
  const [selectedSprite, setSelectedSprite] = useState(0);
  const [animationFrames, setAnimationFrames] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [codeStatus, setCodeStatus] = useState('');
  const [showTestModal, setShowTestModal] = useState(false);
  const [testSpriteManager, setTestSpriteManager] = useState(null);
  const [testMode, setTestMode] = useState('sprite'); // 'sprite' ou 'animation'
  const [testSelectedSprite, setTestSelectedSprite] = useState(0);
  
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const animationRef = useRef(null);

  // Carregar spritesheet
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setSpritesheet(img);
          // Auto-detectar dimensões se possível
          const autoWidth = Math.floor(img.width / gridWidth);
          const autoHeight = Math.floor(img.height / gridHeight);
          setSpriteWidth(autoWidth);
          setSpriteHeight(autoHeight);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // Gerar sprites baseado no grid
  useEffect(() => {
    if (spritesheet) {
      const newSprites = [];
      for (let row = 0; row < gridHeight; row++) {
        for (let col = 0; col < gridWidth; col++) {
          newSprites.push({
            id: row * gridWidth + col,
            x: col * spriteWidth,
            y: row * spriteHeight,
            width: spriteWidth,
            height: spriteHeight,
            name: `sprite_${row}_${col}`
          });
        }
      }
      setSprites(newSprites);
    }
  }, [spritesheet, gridWidth, gridHeight, spriteWidth, spriteHeight]);

  // Desenhar sprite selecionado no canvas
  useEffect(() => {
    if (spritesheet && sprites.length > 0 && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const sprite = sprites[selectedSprite];
      
      if (sprite) {
        canvas.width = spriteWidth * 4; // Ampliado 4x
        canvas.height = spriteHeight * 4;
        
        ctx.imageSmoothingEnabled = false; // Pixel art
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(
          spritesheet,
          sprite.x, sprite.y, sprite.width, sprite.height,
          0, 0, canvas.width, canvas.height
        );
      }
    }
  }, [spritesheet, sprites, selectedSprite, spriteWidth, spriteHeight]);

  // Sistema de animação
  useEffect(() => {
    if (isPlaying && animationFrames.length > 0) {
      animationRef.current = setInterval(() => {
        setCurrentFrame(prev => (prev + 1) % animationFrames.length);
        setSelectedSprite(animationFrames[currentFrame]);
      }, 200); // 5 FPS
    } else {
      clearInterval(animationRef.current);
    }
    
    return () => clearInterval(animationRef.current);
  }, [isPlaying, animationFrames, currentFrame]);

  // Adicionar/remover frame da animação
  const toggleAnimationFrame = (spriteId) => {
    setAnimationFrames(prev => {
      if (prev.includes(spriteId)) {
        return prev.filter(id => id !== spriteId);
      } else {
        return [...prev, spriteId];
      }
    });
  };

  // Gerar código JavaScript
  const generateCode = () => {
    const spritesheetData = {
      image: 'path/to/your/spritesheet.png',
      spriteWidth,
      spriteHeight,
      sprites: sprites.reduce((acc, sprite) => {
        acc[sprite.name] = {
          x: sprite.x,
          y: sprite.y,
          width: sprite.width,
          height: sprite.height
        };
        return acc;
      }, {}),
      animations: animationFrames.length > 0 ? {
        default: animationFrames.map(frameId => sprites[frameId]?.name).filter(Boolean)
      } : {}
    };

    const code = `// Configuração do Spritesheet
const spritesheetConfig = ${JSON.stringify(spritesheetData, null, 2)};

// Classe para gerenciar sprites
class SpriteManager {
  constructor(imagePath, config) {
    this.image = new Image();
    this.image.src = imagePath;
    this.config = config;
    this.animations = new Map();
  }

  // Desenhar sprite específico
  drawSprite(ctx, spriteName, x, y, scale = 1) {
    const sprite = this.config.sprites[spriteName];
    if (!sprite) return false;
    
    ctx.drawImage(
      this.image,
      sprite.x, sprite.y, sprite.width, sprite.height,
      x, y, sprite.width * scale, sprite.height * scale
    );
    return true;
  }

  // Criar animação
  createAnimation(name, frames, fps = 5) {
    this.animations.set(name, {
      frames,
      fps,
      currentFrame: 0,
      lastUpdate: 0
    });
  }

  // Atualizar e desenhar animação
  drawAnimation(ctx, animationName, x, y, scale = 1, deltaTime) {
    const animation = this.animations.get(animationName);
    if (!animation) return false;

    animation.lastUpdate += deltaTime;
    const frameTime = 1000 / animation.fps;

    if (animation.lastUpdate >= frameTime) {
      animation.currentFrame = (animation.currentFrame + 1) % animation.frames.length;
      animation.lastUpdate = 0;
    }

    const currentSprite = animation.frames[animation.currentFrame];
    return this.drawSprite(ctx, currentSprite, x, y, scale);
  }
}

// Exemplo de uso:
// const spriteManager = new SpriteManager('spritesheet.png', spritesheetConfig);
// spriteManager.createAnimation('walk', spritesheetConfig.animations.default);
// spriteManager.drawAnimation(ctx, 'walk', x, y, 2, deltaTime);`;

    // Tentar copiar para clipboard e mostrar código
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(() => {
        setCodeStatus('Código copiado para a área de transferência!');
        setTimeout(() => setCodeStatus(''), 3000);
      }).catch(() => {
        setCodeStatus('Erro ao copiar. Código exibido abaixo.');
      });
    } else {
      setCodeStatus('Clipboard não disponível. Código exibido abaixo.');
    }
    
    // Sempre mostrar o código no campo de texto
    setGeneratedCode(code);
  };

  // Testar código gerado
  const testGeneratedCode = () => {
    if (!spritesheet || !generatedCode) return;
    
    // Criar configuração de teste
    const spritesheetData = {
      image: spritesheet.src,
      spriteWidth,
      spriteHeight,
      sprites: sprites.reduce((acc, sprite) => {
        acc[sprite.name] = {
          x: sprite.x,
          y: sprite.y,
          width: sprite.width,
          height: sprite.height
        };
        return acc;
      }, {}),
      animations: animationFrames.length > 0 ? {
        default: animationFrames.map(frameId => sprites[frameId]?.name).filter(Boolean)
      } : {}
    };

    // Classe SpriteManager para teste
    class TestSpriteManager {
      constructor(imageElement, config) {
        this.image = imageElement;
        this.config = config;
        this.animations = new Map();
      }

      drawSprite(ctx, spriteName, x, y, scale = 1) {
        const sprite = this.config.sprites[spriteName];
        if (!sprite) return false;
        
        ctx.drawImage(
          this.image,
          sprite.x, sprite.y, sprite.width, sprite.height,
          x, y, sprite.width * scale, sprite.height * scale
        );
        return true;
      }

      createAnimation(name, frames, fps = 5) {
        this.animations.set(name, {
          frames,
          fps,
          currentFrame: 0,
          lastUpdate: 0
        });
      }

      drawAnimation(ctx, animationName, x, y, scale = 1, deltaTime) {
        const animation = this.animations.get(animationName);
        if (!animation || !animation.frames || animation.frames.length === 0) return false;

        animation.lastUpdate += deltaTime;
        const frameTime = 1000 / animation.fps;

        if (animation.lastUpdate >= frameTime) {
          animation.currentFrame = (animation.currentFrame + 1) % animation.frames.length;
          animation.lastUpdate = 0;
        }

        const currentSprite = animation.frames[animation.currentFrame];
        return this.drawSprite(ctx, currentSprite, x, y, scale);
      }

      getCurrentAnimationFrame(animationName) {
        const animation = this.animations.get(animationName);
        if (!animation || !animation.frames || animation.frames.length === 0) return null;
        return animation.frames[animation.currentFrame];
      }
    }

    // Criar instância do SpriteManager
    const manager = new TestSpriteManager(spritesheet, spritesheetData);
    
    // Criar animação se existir
    if (spritesheetData.animations.default && spritesheetData.animations.default.length > 0) {
      manager.createAnimation('test', spritesheetData.animations.default, 5);
    }
    
    setTestSpriteManager(manager);
    setShowTestModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-400">
          Mapeador de Spritesheet
        </h1>

        {/* Upload */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
          >
            <Upload size={20} />
            Carregar Spritesheet
          </button>
        </div>

        {spritesheet && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Configurações */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-green-400">Configurações</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm mb-1">Grid W:</label>
                    <input
                      type="number"
                      value={gridWidth}
                      onChange={(e) => setGridWidth(Number(e.target.value))}
                      className="w-full bg-gray-700 rounded px-2 py-1"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Grid H:</label>
                    <input
                      type="number"
                      value={gridHeight}
                      onChange={(e) => setGridHeight(Number(e.target.value))}
                      className="w-full bg-gray-700 rounded px-2 py-1"
                      min="1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm mb-1">Sprite W:</label>
                    <input
                      type="number"
                      value={spriteWidth}
                      onChange={(e) => setSpriteWidth(Number(e.target.value))}
                      className="w-full bg-gray-700 rounded px-2 py-1"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Sprite H:</label>
                    <input
                      type="number"
                      value={spriteHeight}
                      onChange={(e) => setSpriteHeight(Number(e.target.value))}
                      className="w-full bg-gray-700 rounded px-2 py-1"
                      min="1"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <h3 className="font-bold mb-2 text-yellow-400">Animação</h3>
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className={`flex items-center gap-1 px-3 py-1 rounded text-sm ${
                        isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                      } transition-colors`}
                    >
                      <Play size={16} />
                      {isPlaying ? 'Parar' : 'Play'}
                    </button>
                    <button
                      onClick={() => setAnimationFrames([])}
                      className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-sm transition-colors"
                    >
                      Limpar
                    </button>
                  </div>
                  <div className="text-sm text-gray-300">
                    Frames: {animationFrames.length}
                  </div>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-purple-400">Preview</h2>
              
              <div className="bg-gray-700 rounded-lg p-4 mb-4 flex justify-center">
                <canvas
                  ref={canvasRef}
                  className="border border-gray-600 bg-black"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>

              <div className="text-center text-sm text-gray-300">
                Sprite: {sprites[selectedSprite]?.name || 'N/A'}
                <br />
                Posição: {sprites[selectedSprite]?.x || 0}, {sprites[selectedSprite]?.y || 0}
              </div>

              <button
                onClick={generateCode}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
              >
                <Download size={20} />
                Gerar Código
              </button>
              
              {codeStatus && (
                <div className="mt-2 text-sm text-green-400 text-center">
                  {codeStatus}
                </div>
              )}

              {/* Campo de código gerado */}
              {generatedCode && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-bold text-purple-400">Código Gerado:</h3>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedCode).then(() => {
                          setCodeStatus('Copiado novamente!');
                          setTimeout(() => setCodeStatus(''), 2000);
                        });
                      }}
                      className="px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded text-xs transition-colors mr-2"
                    >
                      Copiar
                    </button>
                    <button
                      onClick={testGeneratedCode}
                      className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs transition-colors"
                    >
                      Testar
                    </button>
                  </div>
                  <textarea
                    value={generatedCode}
                    readOnly
                    className="w-full h-64 bg-gray-900 text-green-400 text-xs font-mono p-3 rounded border border-gray-600 resize-none"
                    style={{ fontFamily: 'monospace' }}
                  />
                </div>
              )}
            </div>

            {/* Lista de Sprites */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-orange-400">Sprites</h2>
              
              <div className="grid grid-cols-4 gap-2 max-h-96 overflow-y-auto">
                {sprites.map((sprite) => (
                  <div
                    key={sprite.id}
                    className={`relative aspect-square border-2 rounded cursor-pointer transition-all ${
                      selectedSprite === sprite.id
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-gray-600 hover:border-gray-400'
                    }`}
                    onClick={() => setSelectedSprite(sprite.id)}
                  >
                    <canvas
                      width={spriteWidth}
                      height={spriteHeight}
                      className="w-full h-full object-contain"
                      style={{ imageRendering: 'pixelated' }}
                      ref={(canvas) => {
                        if (canvas && spritesheet) {
                          const ctx = canvas.getContext('2d');
                          ctx.imageSmoothingEnabled = false;
                          ctx.clearRect(0, 0, spriteWidth, spriteHeight);
                          ctx.drawImage(
                            spritesheet,
                            sprite.x, sprite.y, sprite.width, sprite.height,
                            0, 0, spriteWidth, spriteHeight
                          );
                        }
                      }}
                    />
                    
                    {/* Indicador de animação */}
                    {animationFrames.includes(sprite.id) && (
                      <div className="absolute top-0 right-0 w-3 h-3 bg-yellow-500 rounded-full border border-gray-800"></div>
                    )}
                    
                    {/* Botão para adicionar à animação */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAnimationFrame(sprite.id);
                      }}
                      className="absolute bottom-0 right-0 w-4 h-4 bg-gray-700 hover:bg-yellow-600 rounded-tl text-xs flex items-center justify-center transition-colors"
                    >
                      <Square size={8} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal de Teste */}
        {showTestModal && testSpriteManager && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b border-gray-700">
                <h3 className="text-xl font-bold text-green-400">Teste do Código</h3>
                <button
                  onClick={() => setShowTestModal(false)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
                >
                  Fechar
                </button>
              </div>
              
              <div className="p-4">
                {/* Controles de teste */}
                <div className="flex gap-4 mb-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTestMode('sprite')}
                      className={`px-3 py-2 rounded ${
                        testMode === 'sprite' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-600 text-gray-300 hover:bg-gray-700'
                      } transition-colors`}
                    >
                      Teste Individual
                    </button>
                    <button
                      onClick={() => setTestMode('animation')}
                      className={`px-3 py-2 rounded ${
                        testMode === 'animation' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-600 text-gray-300 hover:bg-gray-700'
                      } transition-colors`}
                      disabled={animationFrames.length === 0}
                      title={animationFrames.length === 0 ? 'Adicione frames à animação primeiro' : ''}
                    >
                      Teste Animação {animationFrames.length > 0 ? `(${animationFrames.length} frames)` : '(0 frames)'}
                    </button>
                  </div>
                  
                  {testMode === 'sprite' && (
                    <div className="flex items-center gap-2">
                      <label className="text-sm">Sprite:</label>
                      <select
                        value={testSelectedSprite}
                        onChange={(e) => setTestSelectedSprite(Number(e.target.value))}
                        className="bg-gray-700 rounded px-2 py-1 text-sm"
                      >
                        {sprites.map((sprite, index) => (
                          <option key={sprite.id} value={index}>
                            {sprite.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Canvas de teste */}
                <div className="bg-gray-900 rounded-lg p-4 flex justify-center">
                  <TestCanvas 
                    spriteManager={testSpriteManager}
                    mode={testMode}
                    selectedSprite={sprites[testSelectedSprite]?.name}
                    sprites={sprites}
                  />
                </div>

                {/* Informações */}
                <div className="mt-4 text-sm text-gray-300">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <strong>Configuração:</strong>
                      <ul className="ml-4 mt-1">
                        <li>• Sprites: {sprites.length}</li>
                        <li>• Tamanho: {spriteWidth}x{spriteHeight}px</li>
                      </ul>
                    </div>
                    <div>
                      <strong>Animação:</strong>
                      <ul className="ml-4 mt-1">
                        <li>• Frames: {animationFrames.length}</li>
                        <li>• Status: {testMode === 'animation' ? 'Rodando' : 'Parado'}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Código */}
        {showCodeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b border-gray-700">
                <h3 className="text-xl font-bold text-purple-400">Código Gerado</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedCode).then(() => {
                        setCodeStatus('Copiado!');
                        setTimeout(() => setCodeStatus(''), 2000);
                      });
                    }}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
                  >
                    Copiar
                  </button>
                  <button
                    onClick={() => setShowCodeModal(false)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </div>
              
              <div className="p-4 overflow-auto max-h-[70vh]">
                <pre className="bg-gray-900 p-4 rounded text-sm overflow-x-auto">
                  <code className="text-green-400">{generatedCode}</code>
                </pre>
              </div>
              
              {codeStatus && (
                <div className="px-4 pb-4">
                  <div className="text-sm text-green-400 text-center">
                    {codeStatus}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {!spritesheet && (
          <div className="text-center py-20 text-gray-400">
            <Grid size={64} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">Carregue um spritesheet para começar</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente do Canvas de Teste
const TestCanvas = ({ spriteManager, mode, selectedSprite, sprites }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const lastTimeRef = useRef(0);
  const [currentAnimationFrame, setCurrentAnimationFrame] = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !spriteManager) return;

    const ctx = canvas.getContext('2d');
    canvas.width = 400;
    canvas.height = 300;
    ctx.imageSmoothingEnabled = false;

    const drawBackground = () => {
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Grade de fundo
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    };

    if (mode === 'sprite') {
      // Desenhar sprite individual
      const drawFrame = () => {
        drawBackground();

        // Desenhar sprite no centro
        if (selectedSprite) {
          const centerX = canvas.width / 2 - (spriteManager.config.spriteWidth * 3) / 2;
          const centerY = canvas.height / 2 - (spriteManager.config.spriteHeight * 3) / 2;
          spriteManager.drawSprite(ctx, selectedSprite, centerX, centerY, 3);
        }
      };
      
      drawFrame();
      
    } else if (mode === 'animation') {
      // Verificar se tem animação
      if (!spriteManager.animations.has('test')) {
        drawBackground();
        ctx.fillStyle = '#ff6b6b';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Nenhuma animação configurada', canvas.width / 2, canvas.height / 2);
        return;
      }

      // Desenhar animação
      const animate = (currentTime) => {
        const deltaTime = currentTime - lastTimeRef.current;
        lastTimeRef.current = currentTime;

        drawBackground();

        // Desenhar animação no centro
        const centerX = canvas.width / 2 - (spriteManager.config.spriteWidth * 3) / 2;
        const centerY = canvas.height / 2 - (spriteManager.config.spriteHeight * 3) / 2;
        
        const success = spriteManager.drawAnimation(ctx, 'test', centerX, centerY, 3, deltaTime);
        
        if (success) {
          // Atualizar informação do frame atual
          const currentFrame = spriteManager.getCurrentAnimationFrame('test');
          if (currentFrame) {
            setCurrentAnimationFrame(currentFrame);
          }
        } else {
          // Se falhar, mostrar mensagem de erro
          ctx.fillStyle = '#ff6b6b';
          ctx.font = '16px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Erro na animação', canvas.width / 2, canvas.height / 2);
        }

        animationRef.current = requestAnimationFrame(animate);
      };

      lastTimeRef.current = performance.now();
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [spriteManager, mode, selectedSprite]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        className="border border-gray-600 bg-gray-900"
        style={{ imageRendering: 'pixelated' }}
      />
      {mode === 'animation' && currentAnimationFrame && (
        <div className="mt-2 text-xs text-gray-400 text-center">
          Frame atual: {currentAnimationFrame}
        </div>
      )}
    </div>
  );
};

export default SpritesheetMapper;