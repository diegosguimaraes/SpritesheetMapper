# 🎮 Spritesheet Mapper

Uma ferramenta web interativa para mapear e gerenciar spritesheets, criada com React. Facilita o processo de extração de sprites individuais e criação de animações a partir de uma única imagem de spritesheet.

## ✨ Funcionalidades

- **Upload de Spritesheet**: Carregue qualquer imagem PNG/JPG como spritesheet
- **Configuração Flexível**: Ajuste dimensões do grid e tamanho dos sprites
- **Preview em Tempo Real**: Visualize sprites individuais com ampliação 4x
- **Sistema de Animação**: Crie sequências de animação selecionando múltiplos frames
- **Geração de Código**: Gera automaticamente código JavaScript pronto para uso
- **Teste Integrado**: Teste sprites individuais e animações diretamente na ferramenta
- **Interface Intuitiva**: Design moderno com tema escuro otimizado para pixel art

## 🚀 Como Usar

### 1. Carregando um Spritesheet
- Clique em "Carregar Spritesheet"
- Selecione sua imagem (PNG, JPG, etc.)
- A ferramenta tentará detectar automaticamente as dimensões

### 2. Configurando o Grid
- **Grid W/H**: Número de colunas e linhas do spritesheet
- **Sprite W/H**: Largura e altura de cada sprite individual
- Os valores são ajustados automaticamente, mas podem ser modificados

### 3. Criando Animações
- Clique no botão pequeno (quadrado) no canto inferior direito de cada sprite
- Sprites adicionados à animação mostrarão um indicador amarelo
- Use os botões "Play/Parar" para testar a animação
- "Limpar" remove todos os frames da animação

### 4. Gerando Código
- Clique em "Gerar Código" para criar o JavaScript
- O código é copiado automaticamente para a área de transferência
- Use "Testar" para validar o código gerado na própria ferramenta

## 🛠️ Instalação

### Pré-requisitos
- Node.js (versão 14 ou superior)
- npm ou yarn

### Passos
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/spritesheet-mapper.git

# Entre no diretório
cd spritesheet-mapper

# Instale as dependências
npm install

# Execute o projeto
npm start
```

## 📦 Dependências

- **React 18+**: Framework principal
- **Lucide React**: Ícones
- **Tailwind CSS**: Estilização

## 🎯 Código Gerado

A ferramenta gera uma classe `SpriteManager` completa com:

```javascript
// Exemplo de uso do código gerado
const spriteManager = new SpriteManager('spritesheet.png', spritesheetConfig);

// Desenhar sprite individual
spriteManager.drawSprite(ctx, 'sprite_0_0', x, y, scale);

// Criar e reproduzir animação
spriteManager.createAnimation('walk', ['sprite_0_0', 'sprite_0_1', 'sprite_0_2']);
spriteManager.drawAnimation(ctx, 'walk', x, y, scale, deltaTime);
```

### Características do Código
- **Sem dependências externas**: Funciona com Canvas nativo
- **Sistema de animação baseado em tempo**: FPS configurável
- **Escalonamento**: Suporte a diferentes tamanhos de renderização
- **Gerenciamento de estado**: Controle automático de frames
- **Fácil integração**: Pronto para usar em qualquer projeto JavaScript

## 🎨 Casos de Uso

- **Desenvolvimento de jogos**: Ideal para jogos 2D em Canvas/WebGL
- **Animações web**: Sprites animados para sites e aplicações
- **Prototipagem**: Teste rápido de animações de personagens
- **Educação**: Ferramenta didática para ensino de pixel art e animação

## 🖼️ Formatos Suportados

- PNG (recomendado para pixel art)
- JPG/JPEG
- GIF (frame único)
- WebP
- BMP

## ⚡ Performance

- **Renderização otimizada**: Canvas com `imageSmoothingEnabled: false` para pixel art
- **Animações fluidas**: Sistema baseado em `requestAnimationFrame`
- **Baixo uso de memória**: Carregamento sob demanda de sprites

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Roadmap

- [ ] Suporte a spritesheets irregulares
- [ ] Export para diferentes formatos (JSON, XML)
- [ ] Integração com engines populares (Phaser, PixiJS)
- [ ] Sistema de layers para sprites compostos
- [ ] Editor de hitboxes/collision boxes
- [ ] Importação de arquivos de configuração existentes

## 🐛 Problemas Conhecidos

- Arquivos muito grandes (>10MB) podem causar lentidão
- Animações com muitos frames (>50) podem impactar performance
- Clipboard API pode não funcionar em alguns navegadores antigos

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

Feito com ❤️ para a comunidade de desenvolvimento de jogos indie.

---

**⭐ Se este projeto foi útil para você, considere dar uma estrela no repositório!**
